import { Test, TestingModule } from '@nestjs/testing';
import { VisualizationsController } from './visualizations.controller';
import { VisualizationsService } from './visualizations.service';
import {
  VisualizationResponseDto,
  UpdateVisualizationDto,
  UpdateVisualizationResponseDto,
} from './dto/visualizations.dto';

describe('VisualizationsController', () => {
  let controller: VisualizationsController;

  const mockVisualizationId = '123e4567-e89b-12d3-a456-426614174000';
  const mockAnalysisId = '987fcdeb-51a2-3bc4-d567-890123456789';

  const mockVisualizationResponse: VisualizationResponseDto = {
    visualizationId: mockVisualizationId,
    nodes: [
      {
        id: '1',
        label: 'src',
        group: 'backend',
        x: 100,
        y: 200,
        contents: 'API 컨트롤러',
      },
    ],
    edges: [],
  };

  const mockUpdateResponse: UpdateVisualizationResponseDto = {
    visualizationId: mockVisualizationId,
    success: true,
  };

  const mockGetVisualization = jest.fn();
  const mockResetVisualization = jest.fn();
  const mockUpdateVisualization = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisualizationsController],
      providers: [
        {
          provide: VisualizationsService,
          useValue: {
            getVisualization: mockGetVisualization,
            resetVisualization: mockResetVisualization,
            updateVisualization: mockUpdateVisualization,
          },
        },
      ],
    }).compile();

    controller = module.get<VisualizationsController>(VisualizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getVisualization', () => {
    it('analysisId로 시각화 데이터를 조회해야 함', async () => {
      mockGetVisualization.mockResolvedValue(mockVisualizationResponse);

      const result = await controller.getVisualization(mockAnalysisId);

      expect(mockGetVisualization).toHaveBeenCalledWith(mockAnalysisId);
      expect(result).toEqual(mockVisualizationResponse);
    });
  });

  describe('resetVisualization', () => {
    it('visualizationId로 시각화 데이터를 초기화해야 함', async () => {
      mockResetVisualization.mockResolvedValue(mockVisualizationResponse);

      const result = await controller.resetVisualization(mockVisualizationId);

      expect(mockResetVisualization).toHaveBeenCalledWith(mockVisualizationId);
      expect(result).toEqual(mockVisualizationResponse);
    });
  });

  describe('updateVisualization', () => {
    it('시각화 데이터를 업데이트해야 함', async () => {
      const updateDto: UpdateVisualizationDto = {
        formattedData: [
          {
            id: '1',
            label: 'src',
            group: 'backend',
            x: 150,
            y: 250,
          },
        ],
      };
      mockUpdateVisualization.mockResolvedValue(mockUpdateResponse);

      const result = await controller.updateVisualization(
        mockVisualizationId,
        updateDto,
      );

      expect(mockUpdateVisualization).toHaveBeenCalledWith(
        mockVisualizationId,
        updateDto,
      );
      expect(result).toEqual(mockUpdateResponse);
    });
  });
});
