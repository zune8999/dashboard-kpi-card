import './Loading.css';

export function Loading() {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <span>加载中...</span>
    </div>
  );
}