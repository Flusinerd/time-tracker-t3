import { useState } from "react";

const TimeTrackingsPage = () => {
  const [isTracking, setIsTracking] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="gradient-text ml-3 pb-1 text-4xl font-bold">
        Time Trackings
      </h1>
      <form className="flex items-end gap-4">
        <div className="form-control">
          <label className="label">Project</label>
          <select className="select select-bordered">
            <option disabled selected>
              Please select a Project
            </option>
            <option>Project</option>
            <option>Project 1</option>
            <option>Project 2</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">Task</label>
          <select className="select select-bordered">
            <option disabled selected>
              Please select a Task
            </option>
            <option>Project</option>
            <option>Project 1</option>
            <option>Project 2</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">Description</label>
          <input type="text" className="input input-bordered"></input>
        </div>
        {isTracking ? (
          <button className="btn btn-outline btn-error">Stop tracking</button>
        ) : (
          <button className="btn btn-outline-gradient">
            <span className="gradient-text">Start tracking</span>
          </button>
        )}
      </form>
    </div>
  );
};

export default TimeTrackingsPage;
