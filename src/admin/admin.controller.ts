import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SetFreeTimeDto } from './setFreeTime.dto';

@Controller('/api/admin')
export class AdminController {

  @Post('/setFreeTime')
  @UseGuards() // Example guard for JWT authentication, adjust as per your setup
  async setFreeTime(@Body() freeTimeDto: SetFreeTimeDto, @Res() res: Response): Promise<void> {
    try {
      // Use Microsoft Graph API to create events indicating free time
      const adminEmail = "imane.marrouss@outlook.com" ;
      const startDateTime = freeTimeDto.startDateTime;
      const endDateTime = freeTimeDto.endDateTime;

      // Implement logic to create an event in the professional's calendar using Microsoft Graph API

      res.status(200).json({ message: 'Free time set successfully' });
    } catch (error) {
      console.error('Error setting free time:', error);
      res.status(500).json({ error: 'Error setting free time' });
    }
  }
}
