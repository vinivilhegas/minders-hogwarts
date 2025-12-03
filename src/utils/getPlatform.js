export function detectPlatform() {
  const ua = navigator.userAgent || window.opera;

  if (/android/i.test(ua)) return "mobile_web";
  if (/iPhone|iPad|iPod/i.test(ua)) return "mobile_web";
  if (/Mobile|Mobi|Tablet/i.test(ua)) return "mobile_web";

  return "desktop_web";
}