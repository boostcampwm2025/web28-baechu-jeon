/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { VisualizationsService } from './visualizations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('VisualizationsService', () => {
  let service: VisualizationsService;
  let prisma: PrismaService;

  const mockVisualizationId = 'viz-123';
  const mockAnalysisId = 'analysis-123';

  const mockPrisma = {
    visualization: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    node: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    edge: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisualizationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VisualizationsService>(VisualizationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getVisualization', () => {
    it('기존 시각화 데이터가 있으면 해당 데이터를 반환해야 함', async () => {
      mockPrisma.visualization.findFirst.mockResolvedValue({
        id: mockVisualizationId,
      });
      mockPrisma.node.findMany.mockResolvedValue([
        { id: 'n1', x: 100, y: 100, label: 'test' },
      ]);
      mockPrisma.edge.findMany.mockResolvedValue([]);

      const result = await service.getVisualization(mockAnalysisId);

      expect(result.visualizationId).toBe(mockVisualizationId);
      expect(result.layoutState).toBe('LAYOUTED');
    });

    it('데이터가 없으면 NotFoundException을 던져야 함', async () => {
      mockPrisma.visualization.findFirst.mockResolvedValue(null);
      await expect(service.getVisualization(mockAnalysisId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVisualization', () => {
    it('노드 위치를 업데이트해야 함', async () => {
      const updateDto = {
        nodes: [{ id: 'n1', label: 'test-node', x: 200, y: 300 }],
        edges: [],
      };

      mockPrisma.visualization.findUnique.mockResolvedValue({
        formattedData: { nodes: [{ id: 'n1' }], edges: [] },
      });

      const result = await service.updateVisualization(
        mockVisualizationId,
        updateDto,
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.node.update).toHaveBeenCalled();
    });
  });

  describe('resetVisualization', () => {
    it('초기 레이아웃 데이터를 반환해야 함', async () => {
      const mockSnapshot = {
        nodes: [{ id: 'n1', label: 'root' }],
        edges: [],
      };
      mockPrisma.visualization.findUnique.mockResolvedValue({
        id: mockVisualizationId,
        formattedData: mockSnapshot,
      });

      const result = await service.resetVisualization(mockVisualizationId);
      expect(result.nodes).toEqual(mockSnapshot.nodes);
    });
  });
});
