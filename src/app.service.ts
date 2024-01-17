import { Injectable, Scope } from '@nestjs/common';
import { ConfidentialClientApplication } from '@azure/msal-node';
import axios, { AxiosResponse } from 'axios';


@Injectable({ scope: Scope.REQUEST })
export class AppService {
  private cca?: ConfidentialClientApplication;
  private accessToken?: string;

  constructor(
    //private readonly freeTimeRepository: FreeTimeRepository
    ) {
    const msalConfig = {
      auth: {
        clientId: 'ae9a483d-3839-48b3-a2a9-93bcfa41f2e1',
        authority: 'https://login.microsoftonline.com/f0c4b24d-851a-4404-9623-7e138b887664',
        clientSecret: 'ZNi8Q~G6tj_h-cEtYlm2iqJ8d4GPYbadgekJHcnn',
      },
    };

    this.cca = new ConfidentialClientApplication(msalConfig);
  }

  async getAuthorizationUrl(): Promise<string> {
    if (this.cca) {
      const authCodeUrlParameters = {
        scopes: ['https://graph.microsoft.com/.default'],
        redirectUri: 'http://localhost:3000/response',
      };

      return this.cca.getAuthCodeUrl(authCodeUrlParameters);
    } else {
      throw new Error('ConfidentialClientApplication not initialized.');
    }
  }


  async login(): Promise<void> {
    console.error('Interactive login is not supported in server-side environments');
  }



  async getTokenn(authorizationCode: string): Promise<string | undefined> {
    if (this.cca) {
      try {
        const tokenRequest = {
          code: authorizationCode,
          scopes: ['https://graph.microsoft.com/.default'],
          redirectUri: 'http://localhost:3000/response',
        };
  
        const response = await this.cca.acquireTokenByCode(tokenRequest);
        console.log('Token Response:', response);
  
        if (response && response.accessToken) {
          this.accessToken = response.accessToken;
          console.log('Access token:', this.accessToken);
          console.log('Token scopes:', response.scopes);
          console.log('Token expires at:', response.expiresOn);
  
          return this.accessToken;
        }
      } catch (error) {
        console.error('Error getting access token', error);
      }
    } else {
      console.error('Token retrieval is not supported in non-browser environments');
    }
    return undefined;
  }
  
  async exchangeCodeForToken(code: string): Promise<string | undefined> {
    const tokenRequest = {
      grant_type: 'authorization_code',
      client_id: 'ae9a483d-3839-48b3-a2a9-93bcfa41f2e1',
      client_secret: 'ZNi8Q~G6tj_h-cEtYlm2iqJ8d4GPYbadgekJHcnn',
      redirect_uri: 'http://localhost:3000/response',
      code: code,
    };

    try {
      const response: AxiosResponse = await axios.post(
        'https://login.microsoftonline.com/f0c4b24d-851a-4404-9623-7e138b887664/oauth2/v2.0/token',
        new URLSearchParams(tokenRequest).toString(), // Send data in x-www-form-urlencoded format
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Access token is present in the response data
      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data);
      return undefined;
    }
  }
  

  async handleLoginCallback(code: string) {
    const accessToken = await this.exchangeCodeForToken(code);

    console.log('Access Token:', accessToken);

    return { message: 'Login successful' };
  }

  async getTokennn(): Promise<string | undefined> {
    if (this.cca) {
      try {
        const tokenRequest = {
          scopes: ['https://graph.microsoft.com/.default'
        
            ],
        };

        const response = await this.cca.acquireTokenByClientCredential(tokenRequest);
        console.log('Token Response:', response);

        if (response && response.accessToken) {
          this.accessToken = response.accessToken;
          console.log('Access token:', this.accessToken);
          console.log('Token scopes:', response.scopes);
          console.log('Token expires at:', response.expiresOn);

          return this.accessToken;
        } 
      } catch (error) {
        console.error('Error getting access token', error);
      }
    } else {
      console.error('Token retrieval is not supported in non-browser environments');
    }
    return undefined;

  }


  
  getAccessToken(): string | undefined {
    return this.accessToken;
  }
  getHello(): string {
    return 'Hello World!';
  }
}




