import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Form,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../services/supabase";

const PatientProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (!storedUser) {
        navigate("/login");
        return;
      }

      setUser(storedUser);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role")
        .eq("id", storedUser.id)
        .maybeSingle();

      if (error) {
        console.error("Profile Error:", error);

        Swal.fire({
          icon: "error",
          title: "Unable to Load Profile",
          text: error.message,
        });

        return;
      }

      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");

        setUser(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!fullName || !phone) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
      });

      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Update Error:", error);

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.message,
        });

        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      setUser(data);

      setShowModal(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        confirmButtonText: "OK",
      });

    } catch (error) {
      console.error("Update Error:", error);

      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: "Please try again later.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">

      {/* Header */}

      <nav className="navbar navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">
          🏥 MEDICONNECT
        </span>

        <Button
          variant="light"
          size="sm"
          onClick={() =>
            navigate("/patient/dashboard")
          }
        >
          Dashboard
        </Button>
      </nav>


      {/* Main Content */}

      <Container className="py-5">

        <Row className="justify-content-center">

          <Col
            xs={12}
            md={8}
            lg={6}
          >

            <Card className="shadow-sm border-0">

              <Card.Body className="p-4">

                {/* Profile Header */}

                <div className="text-center mb-4">

                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "90px",
                      height: "90px",
                      fontSize: "36px",
                    }}
                  >
                    {fullName
                      ?.charAt(0)
                      ?.toUpperCase() || "P"}
                  </div>

                  <h3 className="fw-bold mb-1">
                    {fullName}
                  </h3>

                  <p className="text-muted mb-2">
                    {email}
                  </p>

                  <Badge bg="primary">
                    Patient
                  </Badge>

                </div>


                <hr />


                {/* Profile Details */}

                <h5 className="fw-bold mb-4">
                  Personal Information
                </h5>

                <Row className="mb-3">

                  <Col sm={4}>
                    <strong>Full Name</strong>
                  </Col>

                  <Col sm={8}>
                    {fullName}
                  </Col>

                </Row>


                <Row className="mb-3">

                  <Col sm={4}>
                    <strong>Email</strong>
                  </Col>

                  <Col sm={8}>
                    {email}
                  </Col>

                </Row>


                <Row className="mb-3">

                  <Col sm={4}>
                    <strong>Phone</strong>
                  </Col>

                  <Col sm={8}>
                    {phone}
                  </Col>

                </Row>


                <Row className="mb-4">

                  <Col sm={4}>
                    <strong>Role</strong>
                  </Col>

                  <Col sm={8}>
                    <Badge bg="success">
                      Patient
                    </Badge>
                  </Col>

                </Row>


                {/* Edit Button */}

                <div className="d-grid">

                  <Button
                    variant="primary"
                    onClick={() =>
                      setShowModal(true)
                    }
                  >
                    ✏️ Edit Profile
                  </Button>

                </div>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      </Container>


      {/* Edit Profile Modal */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Edit Profile
          </Modal.Title>

        </Modal.Header>


        <Form onSubmit={handleUpdate}>

          <Modal.Body>

            {/* Full Name */}

            <Form.Group className="mb-3">

              <Form.Label>
                Full Name
              </Form.Label>

              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
              />

            </Form.Group>


            {/* Email */}

            <Form.Group className="mb-3">

              <Form.Label>
                Email Address
              </Form.Label>

              <Form.Control
                type="email"
                value={email}
                disabled
              />

              <Form.Text className="text-muted">
                Email address cannot be changed.
              </Form.Text>

            </Form.Group>


            {/* Phone */}

            <Form.Group className="mb-3">

              <Form.Label>
                Phone Number
              </Form.Label>

              <Form.Control
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter your phone number"
              />

            </Form.Group>


            {/* Role */}

            <Form.Group>

              <Form.Label>
                Account Type
              </Form.Label>

              <Form.Control
                type="text"
                value="Patient"
                disabled
              />

            </Form.Group>

          </Modal.Body>


          <Modal.Footer>

            <Button
              variant="secondary"
              type="button"
              onClick={() =>
                setShowModal(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

    </div>
  );
};

export default PatientProfile;