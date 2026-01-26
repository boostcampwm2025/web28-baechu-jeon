/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VisualizationsService } from './visualizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateVisualizationDto } from './dto/visualizations.dto';

describe('VisualizationsService', () => {
  let service: VisualizationsService;

  // Mock 데이터
  const mockVisualizationId = '123e4567-e89b-12d3-a456-426614174000';
  const mockAnalysisId = '987fcdeb-51a2-3bc4-d567-890123456789';

  const mockNodes = [
    {
      id: BigInt(1),
      visualizationId: mockVisualizationId,
      label: 'src',
      groups: 'backend_api_modules',
      x: 100,
      y: 200,
      contents: 'API 컨트롤러',
    },
    {
      id: BigInt(2),
      visualizationId: mockVisualizationId,
      label: 'components',
      groups: 'frontend_components',
      x: 0,
      y: 0,
      contents: 'React 컴포넌트',
    },
  ];

  const mockVisualization = {
    id: mockVisualizationId,
    analysisResultId: mockAnalysisId,
    formattedData: [
      {
        id: '1',
        label: 'src',
        group: 'backend_api_modules',
        x: 100,
        y: 200,
        contents: 'API 컨트롤러',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: mockNodes,
  };

  // Mock functions
  const mockFindFirst = jest.fn();
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockNodeFindMany = jest.fn();
  const mockNodeCreateMany = jest.fn();
  const mockNodeUpdate = jest.fn();
  const mockTransaction = jest.fn();
  const mockQueryRaw = jest.fn();

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup transaction mock
    mockTransaction.mockImplementation(
      <T>(callback: (tx: unknown) => Promise<T>) =>
        callback({
          visualization: {
            create: mockCreate,
            update: mockUpdate,
          },
          node: {
            findMany: mockNodeFindMany,
            createMany: mockNodeCreateMany,
            update: mockNodeUpdate,
          },
        }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisualizationsService,
        {
          provide: PrismaService,
          useValue: {
            visualization: {
              findFirst: mockFindFirst,
              findUnique: mockFindUnique,
              create: mockCreate,
              update: mockUpdate,
            },
            node: {
              findMany: mockNodeFindMany,
              createMany: mockNodeCreateMany,
              update: mockNodeUpdate,
            },
            $transaction: mockTransaction,
            $queryRaw: mockQueryRaw,
          },
        },
      ],
    }).compile();

    service = module.get<VisualizationsService>(VisualizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVisualization', () => {
    it('기존 시각화 데이터가 있으면 해당 데이터를 반환해야 함', async () => {
      mockFindFirst.mockResolvedValue(mockVisualization);

      const result = await service.getVisualization(mockAnalysisId);

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { analysisResultId: mockAnalysisId },
        include: { nodes: true },
      });
      expect(result.visualizationId).toBe(mockVisualizationId);
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toEqual([]);
    });

    it('x, y가 0이면 default로 변환해야 함', async () => {
      mockFindFirst.mockResolvedValue(mockVisualization);

      const result = await service.getVisualization(mockAnalysisId);

      const nodeWithDefault = result.nodes.find((n) => n.id === '2');
      expect(nodeWithDefault?.x).toBe('default');
      expect(nodeWithDefault?.y).toBe('default');

      const nodeWithCoords = result.nodes.find((n) => n.id === '1');
      expect(nodeWithCoords?.x).toBe(100);
      expect(nodeWithCoords?.y).toBe(200);
    });

    it('기존 데이터가 없으면 새로 생성해야 함', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockQueryRaw.mockResolvedValue([]);
      mockCreate.mockResolvedValue({
        id: mockVisualizationId,
        analysisResultId: mockAnalysisId,
        formattedData: [],
      });
      mockNodeCreateMany.mockResolvedValue({ count: 5 });
      mockNodeFindMany.mockResolvedValue(mockNodes);

      const result = await service.getVisualization(mockAnalysisId);

      expect(mockFindFirst).toHaveBeenCalled();
      expect(mockTransaction).toHaveBeenCalled();
      expect(result.visualizationId).toBe(mockVisualizationId);
    });
  });

  describe('resetVisualization', () => {
    it('시각화 데이터를 초기화하고 원본 데이터를 반환해야 함', async () => {
      mockFindUnique.mockResolvedValue(mockVisualization);

      const result = await service.resetVisualization(mockVisualizationId);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockVisualizationId },
      });
      expect(result.visualizationId).toBe(mockVisualizationId);
      expect(result.nodes).toEqual(mockVisualization.formattedData);
      expect(result.edges).toEqual([]);
    });

    it('시각화 데이터가 없으면 NotFoundException을 던져야 함', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        service.resetVisualization(mockVisualizationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('formattedData가 배열이 아니면 빈 배열을 반환해야 함', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockVisualization,
        formattedData: null,
      });

      const result = await service.resetVisualization(mockVisualizationId);

      expect(result.nodes).toEqual([]);
    });
  });

  describe('updateVisualization', () => {
    const updateDto: UpdateVisualizationDto = {
      formattedData: [
        {
          id: '1',
          label: 'src',
          group: 'backend',
          x: 150,
          y: 250,
          contents: 'Updated',
        },
        {
          id: '2',
          label: 'components',
          group: 'frontend',
          x: 'default',
          y: 'default',
        },
      ],
    };

    it('노드 위치와 formattedData를 업데이트해야 함', async () => {
      mockFindUnique.mockResolvedValue(mockVisualization);
      mockNodeUpdate.mockResolvedValue({});
      mockUpdate.mockResolvedValue({});

      const result = await service.updateVisualization(
        mockVisualizationId,
        updateDto,
      );

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockVisualizationId },
      });
      expect(mockTransaction).toHaveBeenCalled();
      expect(result.visualizationId).toBe(mockVisualizationId);
      expect(result.success).toBe(true);
    });

    it('시각화 데이터가 없으면 NotFoundException을 던져야 함', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        service.updateVisualization(mockVisualizationId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('default 값은 0으로 변환하여 저장해야 함', async () => {
      mockFindUnique.mockResolvedValue(mockVisualization);
      mockNodeUpdate.mockResolvedValue({});
      mockUpdate.mockResolvedValue({});

      await service.updateVisualization(mockVisualizationId, updateDto);

      // 첫 번째 노드 (숫자 좌표)
      expect(mockNodeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { x: 150, y: 250 },
      });

      // 두 번째 노드 (default -> 0)
      expect(mockNodeUpdate).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { x: 0, y: 0 },
      });
    });
  });
});
