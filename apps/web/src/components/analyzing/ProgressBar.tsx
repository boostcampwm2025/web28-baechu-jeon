import styles from "./ProgressBar.module.css";

export default function ProgressBar() {
  return (
    <div className="w-full">
      {/* 프로그레스 바 배경 */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
        {/* 좌우로 움직이는 프로그레스 바 */}
        <div
          className={`h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 absolute ${styles.progressBarAnimate}`}
          style={{ width: "40%" }}
        />
      </div>
    </div>
  );
}
