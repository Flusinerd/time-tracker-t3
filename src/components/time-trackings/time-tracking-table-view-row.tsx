import { api, type RouterOutputs } from "../../utils/api";

type TimeTracking = RouterOutputs["timeTrackings"]["getOwn"][0];
type TimeTrackingWithDuration = TimeTracking & { duration: string };

interface TimeTrackingTableViewRowProps {
  timeTracking: TimeTrackingWithDuration;
  onEdit: (timeTracking: TimeTracking) => void;
}

const TimeTrackingTableViewRow = ({
  timeTracking,
  onEdit,
}: TimeTrackingTableViewRowProps) => {
  const utils = api.useContext();

  const deleteTimeTrackingMutation = api.timeTrackings.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.timeTrackings.getOwn.cancel();
      // Remove the deleted time tracking from the cache
      utils.timeTrackings.getOwn.setData(undefined, (data) => {
        if (data) {
          return data.filter((timeTracking) => timeTracking.id !== id);
        }
      });
    },
    onSettled: async () => {
      await utils.timeTrackings.getOwn.invalidate();
    },
  });

  return (
    <tr key={timeTracking.id}>
      <td suppressHydrationWarning>
        {timeTracking.start.toLocaleDateString()}
      </td>
      <td>{timeTracking.Project?.name}</td>
      <td>{timeTracking.Task?.name}</td>
      <td>{timeTracking.description}</td>
      <td suppressHydrationWarning>
        {timeTracking.start.toLocaleTimeString()}
      </td>
      <td suppressHydrationWarning>
        {timeTracking.end?.toLocaleTimeString() ?? "-"}
      </td>
      <td suppressHydrationWarning>{timeTracking.duration}</td>
      <td className="">
        <button
          className="btn btn-error btn-xs mr-2"
          onClick={() =>
            deleteTimeTrackingMutation.mutate({
              id: timeTracking.id,
            })
          }
        >
          Delete
        </button>
        <button
          className="btn btn-primary btn-xs"
          onClick={() => onEdit(timeTracking)}
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default TimeTrackingTableViewRow;
