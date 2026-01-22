import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { VisualizationsService } from './visualizations.service';
import {
  VisualizationResponseDto,
  UpdateVisualizationDto,
  UpdateVisualizationResponseDto,
} from './dto/visualizations.dto';

@Controller('visualizations')
export class VisualizationsController {
  constructor(private readonly visualizationsService: VisualizationsService) {}

  /**
   * 유저가 보게 될 시각화 결과물 조회 api
   * @param analysisId
   * @returns - 시각화로 표현될 분석 내용 (수정 결과 포함)
   */
  @Get(':analysisId')
  async getVisualization(
    @Param('analysisId') analysisId: string,
  ): Promise<VisualizationResponseDto> {
    return await this.visualizationsService.getVisualization(analysisId);
  }

  /**
   * 유저가 초기화 버튼을 눌렀을 시 호출하는 api
   * @param visualizationId
   * @returns - 처음 AI로부터 분석 받았던 결과
   */
  @Get(':visualizationId/reset')
  async resetVisualization(
    @Param('visualizationId') visualizationId: string,
  ): Promise<VisualizationResponseDto> {
    return await this.visualizationsService.resetVisualization(visualizationId);
  }

  /**
   * 유저가 노드 위치를 업데이트할 때 호출하는 api
   * @param visualizationId
   * @param updateDto - 업데이트할 노드 데이터 배열
   * @returns - 성공 여부
   */
  @Put(':visualizationId')
  async updateVisualization(
    @Param('visualizationId') visualizationId: string,
    @Body() updateDto: UpdateVisualizationDto,
  ): Promise<UpdateVisualizationResponseDto> {
    return await this.visualizationsService.updateVisualization(
      visualizationId,
      updateDto,
    );
  }
}
