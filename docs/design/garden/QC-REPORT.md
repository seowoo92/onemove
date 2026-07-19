# 여름 정원 에셋 QC 보고서

## 검사 범위

- 실제 알파 투명도 및 불필요한 배경 픽셀
- 검정·딥그린·하늘색·마젠타 배경에서의 흰색 프린지
- 외곽의 작은 노이즈와 끊김
- 캔버스 규격과 애니메이션 기준점
- baked-in 그림자가 움직임을 방해하는지 여부

## 처리 결과

전체 낱개 에셋의 가장자리 색상을 재계산하고 알파 마스크를 정리했습니다. 특히 햇님의 크림색 잔여 배경과 생성 이미지에 포함됐던 발광 영역을 제거했습니다. 햇님 발광과 지면 그림자는 PNG에 합치지 않고 CSS 레이어로 구현해야 이동·확대 애니메이션에서 자연스럽습니다.

| 파일 | 결과 | 조치 및 판단 |
|---|---|---|
| `garden-tree-big.png` | **PASS** | 화이트 프린지 제거. 자체 음영만 유지. 바닥 그림자는 런타임 분리 권장. |
| `garden-sprout.png` | **PASS** | 잎·줄기 외곽 정리. 하단 회전축에 맞는 캔버스 유지. |
| `garden-cloud.png` | **PASS** | 흰 오브젝트 외곽을 재마스킹. 어두운 배경에서도 회색 사각 잔여물 없음. |
| `garden-flower-a.png` | **PASS** | 꽃잎과 줄기 프린지 제거. 바닥 그림자는 CSS 별도 레이어 사용. |
| `garden-butterfly.png` | **PASS** | 더듬이·날개 외곽 보정. 강한 baked shadow 없음. |
| `garden-tree-small.png` | **PASS** | 크림색 테두리 제거. 큰 나무와 구분되는 축척·수관 유지. |
| `garden-sun.png` | **PASS** | 문제였던 크림색 배경과 baked glow 제거. 발광은 CSS로 구현하도록 변경. |
| `garden-flower-b.png` | **PASS** | 꽃잎·줄기 외곽 보정. 하단 pivot 유지. |
| `garden-bird.png` | **PASS** | 부리·꼬리·발 외곽 보정. 공중/가지 배치용 약한 drop-shadow 권장. |
| `garden-pond.png` | **PASS** | 외곽 프린지 제거. 접지 그림자는 별도 타원 레이어로 구현 권장. |
| `garden-summer-bg.png` | **PASS** | 1080×810 RGB 배경. 움직이는 요소가 놓일 공간 유지. |

## 검수 이미지

- `garden-qc-contact-sheet.jpg`: 네 가지 고대비 배경에서 모든 투명 에셋 확인
- `garden-runtime-shadow-preview.jpg`: 런타임 분리 그림자를 적용한 정적 예시

## 최종 판정

개발 투입 가능 상태입니다. 실제 화면에서는 PNG 에셋에 그림자를 다시 그리지 말고, 요소별 wrapper의 별도 shadow 레이어 또는 CSS filter를 사용하세요.