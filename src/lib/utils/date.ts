/**
 * 日付をフォーマットするユーティリティ関数
 */

/**
 * 日付を日本時間でフォーマット
 * @param dateString - ISO 8601形式の日付文字列またはDateオブジェクト
 * @returns フォーマットされた日本時間の文字列
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // 日本時間でフォーマット
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * 日付のみを日本時間でフォーマット
 * @param dateString - ISO 8601形式の日付文字列またはDateオブジェクト
 * @returns フォーマットされた日本時間の日付文字列
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 時刻のみを日本時間でフォーマット
 * @param dateString - ISO 8601形式の日付文字列またはDateオブジェクト
 * @returns フォーマットされた日本時間の時刻文字列
 */
export function formatTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleTimeString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * 相対的な時間を表示（例：2時間前、3日前）
 * @param dateString - ISO 8601形式の日付文字列またはDateオブジェクト
 * @returns 相対的な時間の文字列
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}時間前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}日前`;
  } else {
    return formatDate(date);
  }
}