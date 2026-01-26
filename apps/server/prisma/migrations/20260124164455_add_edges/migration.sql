-- CreateTable
CREATE TABLE "edges" (
    "id" BIGSERIAL NOT NULL,
    "visualization_id" UUID NOT NULL,
    "source_node" BIGINT NOT NULL,
    "target_node" BIGINT NOT NULL,
    "label" VARCHAR,
    "type" VARCHAR,

    CONSTRAINT "edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purposes" (
    "id" BIGSERIAL NOT NULL,
    "analysis_result_id" UUID NOT NULL,
    "contents" TEXT NOT NULL,

    CONSTRAINT "purposes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "edges_visualization_id_idx" ON "edges"("visualization_id");

-- CreateIndex
CREATE INDEX "edges_source_node_idx" ON "edges"("source_node");

-- CreateIndex
CREATE INDEX "edges_target_node_idx" ON "edges"("target_node");

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_visualization_id_fkey" FOREIGN KEY ("visualization_id") REFERENCES "visualizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_source_node_fkey" FOREIGN KEY ("source_node") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_target_node_fkey" FOREIGN KEY ("target_node") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purposes" ADD CONSTRAINT "purposes_analysis_result_id_fkey" FOREIGN KEY ("analysis_result_id") REFERENCES "analysis_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
