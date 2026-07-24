const WEATHER_MAP = {
  '좋아요': {
    weather: '맑음',
    description: '오늘은 마음도 화창해요',
    image: '/onemove/images/weather-sunny.png',
    color: '#F3D978',
    tint: '#FBF1CF',
  },
  '보통이에요': {
    weather: '구름',
    description: '구름 조금, 그런 날도 있죠',
    image: '/onemove/images/weather-cloudy.png',
    color: '#9FD2B0',
    tint: '#E5F1E9',
  },
  '힘들어요': {
    weather: '비',
    description: '비 오는 날도 지나가요',
    image: '/onemove/images/weather-rainy.png',
    color: '#A9CFE0',
    tint: '#E6F1F6',
  },
}

/**
 * 마음 상태에 해당하는 날씨 이름을 반환한다.
 * @param {string|null} state - '좋아요' | '보통이에요' | '힘들어요'
 * @returns {string|null} 날씨 이름 ('맑음' | '구름' | '비'), 없으면 null
 */
export function getWeather(state) {
  return WEATHER_MAP[state]?.weather ?? null
}

/**
 * 마음 상태에 해당하는 날씨 정보 전체를 반환한다.
 * @param {string|null} state - '좋아요' | '보통이에요' | '힘들어요'
 * @returns {{ weather: string, description: string, image: string, color: string, tint: string }|null}
 */
export function getWeatherInfo(state) {
  return WEATHER_MAP[state] ?? null
}
