export const ROUTINES = [
  // 몸 깨우기
  {
    id: 'routine_01',
    name: '5분 스트레칭',
    area: '몸 깨우기',
    difficulty: '보통',
    easyVersion: { id: 'routine_01_easy', name: '침대에서 목·어깨 30초 돌리기', area: '몸 깨우기', difficulty: '쉬움' },
  },
  {
    id: 'routine_02',
    name: '가벼운 맨몸운동 10분',
    area: '몸 깨우기',
    difficulty: '보통',
    easyVersion: { id: 'routine_02_easy', name: '앉아서 목·어깨·허리 가볍게 풀기 1분', area: '몸 깨우기', difficulty: '쉬움' },
  },
  {
    id: 'routine_03',
    name: '요가·스트레칭 영상 따라하기 10분',
    area: '몸 깨우기',
    difficulty: '보통',
    easyVersion: { id: 'routine_03_easy', name: '온몸 쭉 펴고 기지개 1분', area: '몸 깨우기', difficulty: '쉬움' },
  },
  {
    id: 'routine_04',
    name: '음악 틀고 5분 몸 움직이기',
    area: '몸 깨우기',
    difficulty: '보통',
    easyVersion: { id: 'routine_04_easy', name: '제자리에서 가볍게 걷기 1분', area: '몸 깨우기', difficulty: '쉬움' },
  },

  // 자기돌봄
  {
    id: 'routine_05',
    name: '샤워하기',
    area: '자기돌봄',
    difficulty: '보통',
    easyVersion: { id: 'routine_05_easy', name: '세수하고 물기 닦기', area: '자기돌봄', difficulty: '쉬움' },
  },
  {
    id: 'routine_06',
    name: '머리 감고 단정하게 정돈하기',
    area: '자기돌봄',
    difficulty: '보통',
    easyVersion: { id: 'routine_06_easy', name: '머리 빗어 정리하기', area: '자기돌봄', difficulty: '쉬움' },
  },
  {
    id: 'routine_07',
    name: '손톱 깎고 정리하기',
    area: '자기돌봄',
    difficulty: '보통',
    easyVersion: { id: 'routine_07_easy', name: '거스러미·각질 정리하기', area: '자기돌봄', difficulty: '쉬움' },
  },
  {
    id: 'routine_08',
    name: '편한 옷으로 갈아입기',
    area: '자기돌봄',
    difficulty: '쉬움',
    easyVersion: { id: 'routine_08_easy', name: '양치질하기', area: '자기돌봄', difficulty: '쉬움' },
  },

  // 에너지
  {
    id: 'routine_09',
    name: '직접 차려서 제대로 한 끼 먹기',
    area: '에너지',
    difficulty: '보통',
    easyVersion: { id: 'routine_09_easy', name: '간단한 간식 챙겨 먹기', area: '에너지', difficulty: '쉬움' },
  },
  {
    id: 'routine_10',
    name: '하루 물 1L 마시기',
    area: '에너지',
    difficulty: '보통',
    easyVersion: { id: 'routine_10_easy', name: '물 한 컵 마시기', area: '에너지', difficulty: '쉬움' },
  },
  {
    id: 'routine_11',
    name: '따뜻한 차 우려 마시며 5분 쉬기',
    area: '에너지',
    difficulty: '쉬움',
    easyVersion: { id: 'routine_11_easy', name: '따뜻한 음료 한 잔 마시기', area: '에너지', difficulty: '쉬움' },
  },
  {
    id: 'routine_12',
    name: '영양제·비타민 챙겨 먹기',
    area: '에너지',
    difficulty: '쉬움',
    easyVersion: { id: 'routine_12_easy', name: '과일 한 조각 먹기', area: '에너지', difficulty: '쉬움' },
  },

  // 공간
  {
    id: 'routine_13',
    name: '청소기·물걸레로 바닥 청소하기',
    area: '공간',
    difficulty: '보통',
    easyVersion: { id: 'routine_13_easy', name: '바닥에 떨어진 것 주워 담기', area: '공간', difficulty: '쉬움' },
  },
  {
    id: 'routine_14',
    name: '설거지하기',
    area: '공간',
    difficulty: '보통',
    easyVersion: { id: 'routine_14_easy', name: '싱크대에 그릇 물에 담가두기', area: '공간', difficulty: '쉬움' },
  },
  {
    id: 'routine_15',
    name: '빨래 돌리고 널기',
    area: '공간',
    difficulty: '보통',
    easyVersion: { id: 'routine_15_easy', name: '빨래·옷가지 한곳에 모아두기', area: '공간', difficulty: '쉬움' },
  },
  {
    id: 'routine_16',
    name: '분리수거 정리해서 내놓기',
    area: '공간',
    difficulty: '보통',
    easyVersion: { id: 'routine_16_easy', name: '쓰레기통 비우기', area: '공간', difficulty: '쉬움' },
  },

  // 바깥
  {
    id: 'routine_17',
    name: '20~30분 산책',
    area: '바깥',
    difficulty: '보통',
    easyVersion: { id: 'routine_17_easy', name: '창문 활짝 열고 바깥 풍경 보기', area: '바깥', difficulty: '쉬움' },
  },
  {
    id: 'routine_18',
    name: '가까운 편의점 다녀오기',
    area: '바깥',
    difficulty: '보통',
    easyVersion: { id: 'routine_18_easy', name: '우편함·현관 앞까지 나갔다 오기', area: '바깥', difficulty: '쉬움' },
  },
  {
    id: 'routine_19',
    name: '창문 열고 3분 환기',
    area: '바깥',
    difficulty: '쉬움',
    easyVersion: { id: 'routine_19_easy', name: '커튼 걷고 햇빛 들이기', area: '바깥', difficulty: '쉬움' },
  },
  {
    id: 'routine_20',
    name: '햇볕 쬐며 10분 앉아있기',
    area: '바깥',
    difficulty: '보통',
    easyVersion: { id: 'routine_20_easy', name: '창가에 1분 서서 바깥 보기', area: '바깥', difficulty: '쉬움' },
  },

  // 연결
  {
    id: 'routine_21',
    name: '친구·가족에게 안부 메시지 보내기',
    area: '연결',
    difficulty: '쉬움',
    easyVersion: { id: 'routine_21_easy', name: '이모티콘 하나 보내기', area: '연결', difficulty: '쉬움' },
  },
  {
    id: 'routine_22',
    name: '반가운 사람에게 먼저 연락해보기',
    area: '연결',
    difficulty: '보통',
    easyVersion: { id: 'routine_22_easy', name: '연락하고 싶은 사람 이름 적어보기', area: '연결', difficulty: '쉬움' },
  },
  {
    id: 'routine_23',
    name: '만나고 싶은 사람에게 약속 제안하기',
    area: '연결',
    difficulty: '보통',
    easyVersion: { id: 'routine_23_easy', name: '안부 묻고 싶은 사람 떠올리기', area: '연결', difficulty: '쉬움' },
  },
  {
    id: 'routine_24',
    name: '오늘 고마웠던 것 1가지 적기',
    area: '연결',
    difficulty: '쉬움',
    easyVersion: { id: 'routine_24_easy', name: '고마운 사람 1명 떠올리기', area: '연결', difficulty: '쉬움' },
  },

  // 성취
  {
    id: 'routine_25',
    name: '미뤄둔 일 1개 끝까지 마무리하기',
    area: '성취',
    difficulty: '보통',
    easyVersion: { id: 'routine_25_easy', name: '내일 할 일 1줄만 적기', area: '성취', difficulty: '쉬움' },
  },
  {
    id: 'routine_26',
    name: '오늘 한 일 3줄 적기',
    area: '성취',
    difficulty: '보통',
    easyVersion: { id: 'routine_26_easy', name: '오늘 기분을 단어 1개로 적기', area: '성취', difficulty: '쉬움' },
  },
  {
    id: 'routine_27',
    name: '책 한 챕터 읽기',
    area: '성취',
    difficulty: '보통',
    easyVersion: { id: 'routine_27_easy', name: '책 펴서 한 문단만 읽기', area: '성취', difficulty: '쉬움' },
  },
  {
    id: 'routine_28',
    name: '배우고 싶은 것 30분 공부하기',
    area: '성취',
    difficulty: '보통',
    easyVersion: { id: 'routine_28_easy', name: '궁금한 것 1개 검색해보기', area: '성취', difficulty: '쉬움' },
  },
]

export const ROUTINE_MAP = Object.fromEntries(ROUTINES.map(r => [r.id, r]))
