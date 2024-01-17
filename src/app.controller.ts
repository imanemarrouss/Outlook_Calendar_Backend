import { Body, Controller, Get ,HttpStatus,Post,Query,Req,Res} from "@nestjs/common";
import { AppService } from "./app.service";
import { Client, ClientOptions } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { AuthorizationCodeCredential, ClientSecretCredential, GetTokenOptions, OnBehalfOfCredential } from "@azure/identity";
import {TokenCredentialAuthenticationProvider} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import axios, { AxiosResponse } from "axios";
import { Response } from 'express';
import { PublicClientApplication, InteractionType } from "@azure/msal-browser";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";

const util = require('util')



@Controller()
export class AppController {
  private client: Client; 
  private readonly accessToken: string = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkVDdGF2MTdOTEZuVDdGSG9iZ2RkMkZnMlhHdk11Q1NDSi0xeGZXNW9yWjgiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSIsImtpZCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mMGM0YjI0ZC04NTFhLTQ0MDQtOTYyMy03ZTEzOGI4ODc2NjQvIiwiaWF0IjoxNzA1NDU0NzIxLCJuYmYiOjE3MDU0NTQ3MjEsImV4cCI6MTcwNTQ2MDI4NCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhWQUFBQW1OVkt2dWYxbjZZc0R4MFhSdTcwMDkyRVZDbk5Mc0Z1YTYwbzE1eWkydVYxMFRBOUwrZzNiRlBGTzRWTHBlMXUiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6Im91dGxvb2tfYXBwIiwiYXBwaWQiOiJhZTlhNDgzZC0zODM5LTQ4YjMtYTJhOS05M2JjZmE0MWYyZTEiLCJhcHBpZGFjciI6IjEiLCJmYW1pbHlfbmFtZSI6Ik1BUlJPVVNTIiwiZ2l2ZW5fbmFtZSI6IkltYW5lIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTA1LjY5LjEwMC4xNDMiLCJuYW1lIjoiSW1hbmUgTUFSUk9VU1MiLCJvaWQiOiI3MGNjZDBhZi1mYWRiLTRiOTItOGVkNS0zNmMxMzU4YTBiODMiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDBGN0M1OTczMSIsInJoIjoiMC5BUkFBVGJMRThCcUZCRVNXSTM0VGk0aDJaQU1BQUFBQUFBQUF3QUFBQUFBQUFBQ1hBTmMuIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWQgQ2FsZW5kYXJzLlJlYWQuU2hhcmVkIENhbGVuZGFycy5SZWFkQmFzaWMgQ2FsZW5kYXJzLlJlYWRXcml0ZSBDYWxlbmRhcnMuUmVhZFdyaXRlLlNoYXJlZCBlbWFpbCBvcGVuaWQgcHJvZmlsZSBVc2VyLlJlYWQiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJTQ2F5OXV3MlVDRWhTTGpYV0N3T2hwdndZUlk3cTNlOGVpRnhocVljVlhJIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFGIiwidGlkIjoiZjBjNGIyNGQtODUxYS00NDA0LTk2MjMtN2UxMzhiODg3NjY0IiwidW5pcXVlX25hbWUiOiJpbWFuZS5tYXJyb3Vzc0BlZHUudWNhLm1hIiwidXBuIjoiaW1hbmUubWFycm91c3NAZWR1LnVjYS5tYSIsInV0aSI6IkwyRjVGX0Y0aEUtUzNuSkZuTnFiQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoiQTVMdWUxVHFfRjJyc0FMck5SekRKMUozeklvVFhWMFpDcVpLYjY0aDVkQSJ9LCJ4bXNfdGNkdCI6MTM4NTcyOTMwNH0.vdDuFpQVKbI_SwSSQazIbzvaxW-Oct-fySpZN7iuH25UmjoGIeCXFIbxE5k8R4TknCsQpAn9K6WCKGwiG6g7JHz9FHoAHoH5JzN18zCzl40CDD0Q_8x2NuJHGAOUCccBv2CXooEd86WxQKMgus5bqiPPgKQKIKhXQicA3oJ82V2qtbWgZaxy7iQ4oFYfiolObOCZh8BTc0IlQi29Yd4mS3RntZNeBrTAN3FuXip9T63sUJzC8M9ibcLSYL1ZhaWjSe7olM8QjidLPvQUYWraA0n-g1cnG3Ng9M2o1OSuDXqctD22K5PNIbcV5YWb1ZkdXOS98E_3rzhXzbr99EG5Mw"

  constructor(private readonly appService: AppService) {
  }

  @Get()
  async getHello(): Promise<string> {
    this.runExample().catch((err) => {
      console.log("Encountered an error:\n\n", err);
    });
    return this.appService.getHello();
  }
  @Get('/api/events')
  async getEvents(@Res() res: Response): Promise<void> {
    await this.runExample(); 
    const events = await this.fetchGraphEvents();
    res.json(events);
  }

  @Post('/api/findMeetingTimes')
  async findMeetingTimes(@Body() meetingTimeSuggestionsResult: any, @Res() res: Response): Promise<void> {
    try {
      const response: Response = await this.client.api('/me/findMeetingTimes').post(meetingTimeSuggestionsResult);
      console.log("API Response:", response);
      res.json(response);
    } catch (error) {
      console.error("Error finding meeting times:", error);
      res.status(500).json({ error: "Error finding meeting times" });
    }
  }

  
  @Post('/api/createFreeTime')
    async createFreeTime(@Body() event: any, @Res() res: Response): Promise<void> {    try {
      await this.runExample();
      const formattedEvent = {
        subject: 'available time',
        start: {
          dateTime: `${event.day}T${event.startTime}`,
          timeZone: event.timeZone, // Use the provided timezone
        },
        end: {
          dateTime: `${event.day}T${event.endTime}`,
          timeZone: event.timeZone, // Use the provided timezone
        },
      };
  
      const response: Response = await this.client.api('/me/events').post(formattedEvent);
      console.log("API Response:", response);
      res.json(response);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Error creating event" });
    }
  }
  
  @Post('/api/createEvent')
async createEvent(
  @Body() { event, selectedTime }: { event: any; selectedTime: string },
  @Res() res: Response
): Promise<void> {
  try {
    await this.runExample();
   
    event.start = { dateTime: selectedTime, timeZone: 'GMT' };
    event.end = { dateTime: selectedTime, timeZone: 'GMT' };
    
    const response: Response = await this.client.api('/me/events').post(event);
    console.log("API Response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Error creating event" });
  }
}


@Get('/getAuthorizationUrl')
  async getAuthorizationUrl(@Res() res: Response): Promise<void> {
    try {
      const authorizationUrl = await this.appService.getAuthorizationUrl();
      res.redirect(authorizationUrl);
    } catch (error) {
      console.error('Error getting authorization URL:', error);
      res.status(500).json({ error: 'Error getting authorization URL' });
    }
  }

  @Get('/exchange-code')
  async exchangeCode(@Query('code') code: string): Promise<string | undefined> {
    return this.appService.exchangeCodeForToken(code);
  }



@Get('/login')
async login(): Promise<void> {
  await this.appService.login();
}


  @Post('/api/findFreeTimes')
  async findFreeTimes(@Body() { emailAddress }: { emailAddress: string }, @Res() res: Response): Promise<void> {
    console.log('Request Payload:', { emailAddress });
    //const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IlJwQnlSeWNpV0VGN3F5OHBLQVVLUkxpQzZLRW9yQTloUjFQTkZoLUZXdVkiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSIsImtpZCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mMGM0YjI0ZC04NTFhLTQ0MDQtOTYyMy03ZTEzOGI4ODc2NjQvIiwiaWF0IjoxNzA1NDQ4MDc5LCJuYmYiOjE3MDU0NDgwNzksImV4cCI6MTcwNTQ1MjQ1MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhWQUFBQXNDaGJwOHZZR2RxbVlIN1pMUWlFSjJWdnAwSmNqQWFUcFQwTkJuWlRHa1lpdUM5eTJjVFJjQmxNTDlzTWNybDUiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6Im91dGxvb2tfYXBwIiwiYXBwaWQiOiJhZTlhNDgzZC0zODM5LTQ4YjMtYTJhOS05M2JjZmE0MWYyZTEiLCJhcHBpZGFjciI6IjEiLCJmYW1pbHlfbmFtZSI6Ik1BUlJPVVNTIiwiZ2l2ZW5fbmFtZSI6IkltYW5lIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTA1LjY5LjEwMC4xNDMiLCJuYW1lIjoiSW1hbmUgTUFSUk9VU1MiLCJvaWQiOiI3MGNjZDBhZi1mYWRiLTRiOTItOGVkNS0zNmMxMzU4YTBiODMiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDBGN0M1OTczMSIsInJoIjoiMC5BUkFBVGJMRThCcUZCRVNXSTM0VGk0aDJaQU1BQUFBQUFBQUF3QUFBQUFBQUFBQ1hBTmMuIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWQgQ2FsZW5kYXJzLlJlYWQuU2hhcmVkIENhbGVuZGFycy5SZWFkQmFzaWMgQ2FsZW5kYXJzLlJlYWRXcml0ZSBDYWxlbmRhcnMuUmVhZFdyaXRlLlNoYXJlZCBlbWFpbCBvcGVuaWQgcHJvZmlsZSBVc2VyLlJlYWQiLCJzdWIiOiJTQ2F5OXV3MlVDRWhTTGpYV0N3T2hwdndZUlk3cTNlOGVpRnhocVljVlhJIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFGIiwidGlkIjoiZjBjNGIyNGQtODUxYS00NDA0LTk2MjMtN2UxMzhiODg3NjY0IiwidW5pcXVlX25hbWUiOiJpbWFuZS5tYXJyb3Vzc0BlZHUudWNhLm1hIiwidXBuIjoiaW1hbmUubWFycm91c3NAZWR1LnVjYS5tYSIsInV0aSI6IjA0QWdSbDZjNWthWXh2TnNhYldSQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoiQTVMdWUxVHFfRjJyc0FMck5SekRKMUozeklvVFhWMFpDcVpLYjY0aDVkQSJ9LCJ4bXNfdGNkdCI6MTM4NTcyOTMwNH0.oOzcATl9-7yvspHEOgmhnRCaM6CwtAA7EPd0JWxYfpezcyTvMZPlfvUVZ_rdRTTKWo7Pb8nPPDKFVHw37LUadAmsqinj3XqSpaciliMVzn9nRAa5kjzyKCpbSz1b-e1nJMal41H7xIX_h7N53hqMzbneZlH03Fm_sBhDUfdv3WG8wJ3GYmA8Z9oWImyXpUTovJ85nTMEtytqSaoFMJZrTHCMnEoeQHD2MbBGvnUXOfuZk15LLvqh_0Fmr39wKveC1Vf9dD3ieqHcTm4IjQYrT9PenFwyvN7ihGIuShRyOz-UdrUnwdN2Fl7iEgjHLDMCK4CiK3UJeWfttAsN5d0DEg"

    try {
      //console.log('Access Token:', accessToken);
      const authProvider = new TokenCredentialAuthenticationProvider(
        {
          
          getToken: async (scopes: string, options?: GetTokenOptions) => {
            return {
              token: this.accessToken,
              expiresOnTimestamp: Date.now() + 3600000, // Assuming the token is valid for 1 hour
            };
          },
        },
        {
          scopes: ["https://graph.microsoft.com/.default"],
        }
      );
      
      const options = {
        authProvider,
      };
      this.client = Client.initWithMiddleware(options);
      const startDateTime = "2024-12-22T00:00:00";
      const endDateTime = "2024-12-24T00:00:00";

      const calendarView = await this.client.api(`/users/${emailAddress}/calendarView`).query({ startDateTime: '2023-12-23T00:00:00', endDateTime: '2023-12-24T00:00:00' })
      .get();

      const freeTimes = calendarView.value
      .filter(event => event.showAs && event.showAs === 'free')
      .map(event => ({
       start: event.start.dateTime,
       end: event.end.dateTime
       }));

       console.log('Calendar events:', calendarView.value);
      console.log('Event types:', calendarView.value.map(event => event.showAs));

      res.json(freeTimes);
    } catch (error) {
      console.error("Error details:", error.response ? error.response.data : error);
      res.status(500).json({ error: "Error finding free times" });
    }
  }


  


   calculateFreeTimes(busyTimes: any[], endDateTime: string): any[] {
    const freeTimes = [];
   
  
     return freeTimes;
  }
  

  async runExample() {
    
    //const accessToken = "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkVDdGF2MTdOTEZuVDdGSG9iZ2RkMkZnMlhHdk11Q1NDSi0xeGZXNW9yWjgiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSIsImtpZCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mMGM0YjI0ZC04NTFhLTQ0MDQtOTYyMy03ZTEzOGI4ODc2NjQvIiwiaWF0IjoxNzA1NDU0NzIxLCJuYmYiOjE3MDU0NTQ3MjEsImV4cCI6MTcwNTQ2MDI4NCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhWQUFBQW1OVkt2dWYxbjZZc0R4MFhSdTcwMDkyRVZDbk5Mc0Z1YTYwbzE1eWkydVYxMFRBOUwrZzNiRlBGTzRWTHBlMXUiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6Im91dGxvb2tfYXBwIiwiYXBwaWQiOiJhZTlhNDgzZC0zODM5LTQ4YjMtYTJhOS05M2JjZmE0MWYyZTEiLCJhcHBpZGFjciI6IjEiLCJmYW1pbHlfbmFtZSI6Ik1BUlJPVVNTIiwiZ2l2ZW5fbmFtZSI6IkltYW5lIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTA1LjY5LjEwMC4xNDMiLCJuYW1lIjoiSW1hbmUgTUFSUk9VU1MiLCJvaWQiOiI3MGNjZDBhZi1mYWRiLTRiOTItOGVkNS0zNmMxMzU4YTBiODMiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDBGN0M1OTczMSIsInJoIjoiMC5BUkFBVGJMRThCcUZCRVNXSTM0VGk0aDJaQU1BQUFBQUFBQUF3QUFBQUFBQUFBQ1hBTmMuIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWQgQ2FsZW5kYXJzLlJlYWQuU2hhcmVkIENhbGVuZGFycy5SZWFkQmFzaWMgQ2FsZW5kYXJzLlJlYWRXcml0ZSBDYWxlbmRhcnMuUmVhZFdyaXRlLlNoYXJlZCBlbWFpbCBvcGVuaWQgcHJvZmlsZSBVc2VyLlJlYWQiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJTQ2F5OXV3MlVDRWhTTGpYV0N3T2hwdndZUlk3cTNlOGVpRnhocVljVlhJIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFGIiwidGlkIjoiZjBjNGIyNGQtODUxYS00NDA0LTk2MjMtN2UxMzhiODg3NjY0IiwidW5pcXVlX25hbWUiOiJpbWFuZS5tYXJyb3Vzc0BlZHUudWNhLm1hIiwidXBuIjoiaW1hbmUubWFycm91c3NAZWR1LnVjYS5tYSIsInV0aSI6IkwyRjVGX0Y0aEUtUzNuSkZuTnFiQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoiQTVMdWUxVHFfRjJyc0FMck5SekRKMUozeklvVFhWMFpDcVpLYjY0aDVkQSJ9LCJ4bXNfdGNkdCI6MTM4NTcyOTMwNH0.vdDuFpQVKbI_SwSSQazIbzvaxW-Oct-fySpZN7iuH25UmjoGIeCXFIbxE5k8R4TknCsQpAn9K6WCKGwiG6g7JHz9FHoAHoH5JzN18zCzl40CDD0Q_8x2NuJHGAOUCccBv2CXooEd86WxQKMgus5bqiPPgKQKIKhXQicA3oJ82V2qtbWgZaxy7iQ4oFYfiolObOCZh8BTc0IlQi29Yd4mS3RntZNeBrTAN3FuXip9T63sUJzC8M9ibcLSYL1ZhaWjSe7olM8QjidLPvQUYWraA0n-g1cnG3Ng9M2o1OSuDXqctD22K5PNIbcV5YWb1ZkdXOS98E_3rzhXzbr99EG5Mw"
    //const accessToken = this.appService.getAccessToken();

    const authProvider = new TokenCredentialAuthenticationProvider(
      {
        getToken: async (scopes: string, options?: GetTokenOptions) => {
          return {
            token: this.accessToken,
            expiresOnTimestamp: Date.now() + 3600000, // Assuming the token is valid for 1 hour
          };
        },
      },
      {
        scopes: ["https://graph.microsoft.com/.default"],
      }
    );
    const options = {
      authProvider,
    };
    this.client = Client.initWithMiddleware(options);
    
    
    const graphClient = Client.initWithMiddleware({ authProvider: authProvider });
    const events = await this.fetchGraphEvents();
    console.log("Fetched events:", events);}

  private async fetchGraphEvents(): Promise<any> {
    try {
      const events = await this.client.api('/me/calendar/events').get();
      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      return { error: "Error fetching events" };
    }
  }
}