# CHEM LAB

물질과 실험 조건을 선택해 반응식, 생성물, 남은 반응물과 화학량론 계산 결과를 확인하는 웹 화학실험실 시뮬레이터입니다.

## 주요 기능

- PubChem 기반 물질 검색과 물질 도감
- 고체·액체 상태에 맞는 투입 단위 선택
- 온도, 압력, pH, 반응 시간 설정
- 중화·침전·기체 발생·산화 환원 반응 판정
- 반응식, 생성물, 남은 반응물, 한계 반응물 계산
- 플라스크의 기포·침전·용해 시각 효과
- Supabase 물질·반응 DB 연동 및 로컬 데이터 자동 대체

## 실행 방법

```bash
pnpm install
pnpm dev
```

`.env.example`을 참고하여 Supabase 환경변수를 설정합니다.

## 데이터베이스

1. `supabase/migrations/20261027000000_initial_chem_lab_schema.sql` 실행
2. `supabase/seed.sql` 실행
3. `SUPABASE_URL`, `SUPABASE_ANON_KEY` 환경변수 등록

연결에 실패하면 사이트에 포함된 교육용 물질·반응 데이터가 자동으로 사용됩니다.

## 배포 사이트

https://chem-lab-simulator.famous-goby-6764.chatgpt.site/

> 계산 결과는 교육용 이상 모델이며 실제 실험 결과와 안전성을 보장하지 않습니다.
