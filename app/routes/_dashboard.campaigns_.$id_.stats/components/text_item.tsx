import { ReactNode } from "react";
import { PiChartLineUp, PiChartLineDown } from "react-icons/pi";

type BottomComponentConfig = {
  sign: "good" | "bad" | "warning" | "neutral";
  direction: "increasing" | "decreasing";
  mainText: string;
};

export function TextItem({
  mainText,
  label,
  icon,
  subText,
  bottomLeftComponent,
  bottomComponentConfig,
  onClick,
}: {
  mainText: string;
  label: string;
  subText?: string;
  bottomLeftComponent?: ReactNode;
  icon?: ReactNode;
  bottomComponentConfig?: BottomComponentConfig;
  onClick?: () => void;
}) {
  return (
    <div className="flex min-h-40 min-w-80 flex-col justify-between bg-secondary p-4 ">
      <div className="flex justify-between">
        <p className="">{label}</p>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-xl font-bold">{mainText}</p>
        {subText && (
          <p className="text-xs text-secondary-foreground">{subText}</p>
        )}
        {/* {bottomLeftComponent} */}
        {bottomComponentConfig && (
          <BottomComponent config={bottomComponentConfig} />
        )}
      </div>
    </div>
  );
}

function BottomComponent({ config }: { config: BottomComponentConfig }) {
  return (
    <div className={`flex gap-1 ${signMap[config.sign]} *:my-auto`}>
      {config.direction == "increasing" && <PiChartLineUp />}
      {config.direction == "decreasing" && <PiChartLineDown />}
      <p className="text-sm">{config.mainText}</p>
    </div>
  );
}

const signMap: Record<BottomComponentConfig["sign"], string> = {
  good: "text-green-500 dark:text-green-300",
  bad: "text-red-700 dark:text-red-300",
  warning: "text-yellow-600 dark:text-yellow-200",
  neutral: "text-grey-900 dark:text-grey-300",
};
