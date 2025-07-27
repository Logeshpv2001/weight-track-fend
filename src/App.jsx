import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Input,
  DatePicker,
  Button,
  // toast,
  Card,
  Typography,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const { Title } = Typography;

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function App() {
  const [weights, setWeights] = useState([]);
  const [form, setForm] = useState({ weight: "", date: "" });
  const [editingId, setEditingId] = useState(null);

  const API_BASE = "https://weight-track-bend.onrender.com/api/weights";

  const fetchWeights = async () => {
    const res = await axios.get(API_BASE);
    setWeights(res.data);
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight || !form.date) return;

    try {
      if (editingId) {
        await axios.patch(`${API_BASE}/${editingId}`, {
          weight: parseFloat(form.weight),
          date: form.date,
        });
        toast.success("Entry Updated successfully", {
          className: "toast-success",
          style: { backgroundColor: "#d1fae5", color: "#065f46" },
        });
      } else {
        await axios.post(API_BASE, {
          weight: parseFloat(form.weight),
          date: form.date,
        });
        toast.success("Entry added successfully", {
          className: "toast-success",
          style: { backgroundColor: "#d1fae5", color: "#065f46" },
        });
      }

      setForm({ weight: "", date: "" });
      setEditingId(null);
      fetchWeights();
    } catch (err) {
      toast.error("Something went wrong", {
        className: "toast-error",
        style: { backgroundColor: "#fee2e2", color: "#991b1b" },
      });
    }
  };

  const handleEdit = (entry) => {
    setForm({
      weight: entry.weight,
      date: dayjs(entry.date).format("YYYY-MM-DD"),
    });
    setEditingId(entry._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);

      toast.success("Deleted successfully", {
        className: "toast-success",
        style: { backgroundColor: "#d1fae5", color: "#065f46" },
      });

      fetchWeights();
    } catch (err) {
      toast.error("Deletion failed", {
        className: "toast-error",
        style: { backgroundColor: "#fee2e2", color: "#991b1b" },
      });
    }
  };

  const chartData = {
    labels: weights.map((w) => formatDate(w.date)),
    datasets: [
      {
        label: "Weight (kg)",
        data: weights.map((w) => w.weight),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        background: "linear-gradient(to bottom right, #e0f7fa, #f1f8ff)",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-xl mx-auto">
        <Card bordered={false} className="shadow-xl rounded-xl">
          <Title level={2} className="text-center mb-4 text-blue-700">
            Weekly Weight Tracker
          </Title>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="Weight (kg)"
              required
            />
            <DatePicker
              format="YYYY-MM-DD"
              className="w-full"
              value={form.date ? dayjs(form.date) : null}
              onChange={(date, dateString) =>
                setForm({ ...form, date: dateString })
              }
              required
            />
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700"
              block
            >
              {editingId ? "Update Entry" : "Add Entry"}
            </Button>
          </form>
        </Card>

        <Card title="Weight History" className="mt-8 rounded-xl shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Weight (kg)</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w._id} className="border-t">
                    <td className="py-1">{formatDate(w.date)}</td>
                    <td className="py-1">{w.weight}</td>
                    <td className="py-1 flex gap-3 items-center">
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(w)}
                        size="small"
                      />
                      <Popconfirm
                        title="Are you sure to delete this entry?"
                        onConfirm={() => handleDelete(w._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Progress Chart" className="mt-8 rounded-xl shadow">
          {weights.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500 text-sm">No data to show.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;
