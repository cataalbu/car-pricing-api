import { IsBoolean } from 'class-validator';

export class AproveReportDto {
  @IsBoolean()
  approved: boolean;
}
