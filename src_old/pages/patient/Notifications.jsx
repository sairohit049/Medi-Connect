import React, { useEffect, useState } from "react";
import { Container, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Unable to load notifications",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    const result = await Swal.fire({
      title: "Delete notification?",
      text: "This notification will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        throw error;
      }

      setNotifications((previous) =>
        previous.filter(
          (notification) => notification.id !== notificationId
        )
      );

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Notification deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message,
      });
    }
  };

  return (
    <Container className="py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted mb-0">
            Stay updated with your appointments and medical activities.
          </p>
        </div>

        <Button
          variant="outline-primary"
          onClick={() => navigate("/patient/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">
            Loading notifications...
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <Alert variant="info" className="text-center">
          You don't have any notifications.
        </Alert>
      ) : (
        <div>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="mb-3 shadow-sm border-0"
            >
              <Card.Body>

                <div className="d-flex justify-content-between align-items-start">

                  <div>
                    <h5 className="fw-bold">
                      {notification.title || "Notification"}

                      {!notification.is_read && (
                        <Badge bg="primary" className="ms-2">
                          New
                        </Badge>
                      )}
                    </h5>

                    <p className="mb-2 text-muted">
                      {notification.message}
                    </p>

                    <small className="text-secondary">
                      {notification.created_at
                        ? new Date(
                            notification.created_at
                          ).toLocaleString()
                        : ""}
                    </small>
                  </div>

                  <div className="ms-3 d-flex gap-2">

                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() =>
                          markAsRead(notification.id)
                        }
                      >
                        Mark Read
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        deleteNotification(notification.id)
                      }
                    >
                      Delete
                    </Button>

                  </div>

                </div>

              </Card.Body>
            </Card>
          ))}
        </div>
      )}

    </Container>
  );
};

export default Notifications;