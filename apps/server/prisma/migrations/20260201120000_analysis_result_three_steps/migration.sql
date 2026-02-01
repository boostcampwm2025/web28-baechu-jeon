-- AnalysisResult 4단계 → 3단계: step2(가설+의도 통합), step3(코드요약), step4 제거

-- 1. step2에 step3(project_intent, user_stories) 병합
UPDATE "analysis_results"
SET "step2" = "step2" || jsonb_build_object(
  'project_intent', "step3"->'project_intent',
  'user_stories', "step3"->'user_stories'
);

-- 2. step4(코드요약)를 step3으로 복사
UPDATE "analysis_results"
SET "step3" = "step4";

-- 3. step4 컬럼 삭제
ALTER TABLE "analysis_results" DROP COLUMN "step4";
