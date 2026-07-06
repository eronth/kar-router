import { RIDER_ICONS, STAR_ICONS } from "../../data/gameData";
import type { Route } from "../../utils/optimizer";
import { formatMs } from "../../utils/time";
import "./RouteCard.css";

export const PICK_STYLES = [
  { id: "inline", label: "1", title: "Everything on one line" },
  { id: "time-below", label: "2", title: "Time on its own row" },
  { id: "time-icons", label: "3", title: "Second row: time, then icons" },
  { id: "icons-time", label: "4", title: "Second row: icons, then time" },
  { id: "split", label: "5", title: "Second row: star, time, rider" },
] as const;

export type PickStyle = (typeof PICK_STYLES)[number]["id"];

export default function RouteCard({
  route,
  rank,
  pickStyle = "inline",
  prevRoute,
}: {
  route: Route;
  rank: number;
  pickStyle?: PickStyle;
  /** Route ranked just above this one; picks that differ from it get a highlight tint. */
  prevRoute?: Route;
}) {
  const prevPicks = new Map(
    prevRoute?.picks.map((p) => [p.course, `${p.star}|${p.rider}`]),
  );

  return (<div className="route-card">

    <div className="route-head">
      <span className="rank">#{rank}</span>
      <span className="total">{formatMs(route.totalMs)}</span>
    </div>

    <div className="route-body">
      {route.picks.map((pick) => {
        const changed =
          prevRoute && prevPicks.get(pick.course) !== `${pick.star}|${pick.rider}`;
        const course = (
          <span className="course" title={pick.course}>
            {pick.course}
          </span>
        );
        const star = <img src={STAR_ICONS[pick.star]} alt={pick.star} title={pick.star} />;
        const rider = <img src={RIDER_ICONS[pick.rider]} alt={pick.rider} title={pick.rider}/>;
        const time = <span className="time">{formatMs(pick.ms)}</span>;

        if (pickStyle === "inline") {
          return (<div className={changed ? "pick pick-changed" : "pick"} key={pick.course}>
            {course}{star}{rider}{time}
          </div>);
        }
        return (<div className={`pick pick-stacked${changed ? " pick-changed" : ""}`} key={pick.course}>
          <div className="pick-row">
            {course}
            {pickStyle === "time-below" && <>{star}{rider}</>}
          </div>
          <div className="pick-row">
            {pickStyle === "time-below" && time}
            {pickStyle === "time-icons" && <>{time}{star}{rider}</>}
            {pickStyle === "icons-time" && <>{star}{rider}{time}</>}
            {pickStyle === "split" && <>{star}{time}{rider}</>}
          </div>
        </div>);
      })}
    </div>

  </div>)
}
