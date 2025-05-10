"use client";

import TimeAgoComponenet from "react-timeago";
function TimeAgo({ date }: { date: Date }) {
  return <TimeAgoComponenet date={date} />;
}

export default TimeAgo;
