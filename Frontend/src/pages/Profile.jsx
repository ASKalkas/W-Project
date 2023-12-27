import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Container,
} from "react-bootstrap";
import AppNavBar from "../components/navbar";
import "../styles/Brands.css";

const backend_url = "http://localhost:3000/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [cookies, removeCookies] = useCookies(["token"]);
  const [profile, setProfile] = useState({
    username: "",
    firstName: "",
    lastName: "",
  });
  const [email, setEmail] = useState("email");

  const [showEditModal, setShowEditModal] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [newFirstName, setNewFirstName] = useState(profile.firstName);
  const [newLastName, setNewLastName] = useState(profile.lastName);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const uid = localStorage.getItem("userId");
        const response = await axios.get(
          `${backend_url}/users/get-profile?_id=${uid}`,
          {
            withCredentials: true,
          }
        );
        setEmail(response.data.user.email);
        setProfile(response.data.user.profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response.status == 403) {
          removeCookies("token");
          navigate("/");
        }
      }
    }

    fetchData();
  }, [cookies]);

  const handleEditProfile = () => {
    setNewUsername(profile.username);
    setNewFirstName(profile.firstName);
    setNewLastName(profile.lastName);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    // Handle updating profile logic here
    console.log("Updating profile...");
    try {
      const response = await axios.put(
        `${backend_url}/users/update-profile?_id=${localStorage.getItem(
          "userId"
        )}`,
        {
          profile: {
            newUsername,
            newFirstName,
            newLastName,
          },
        },
        { withCredentials: true }
      );
      console.log(response);
      if (response.status === 200) setProfile(response.data.user.profile);
      setShowEditModal(false);
    } catch (error) {
      if (error.response.status == 403) {
        removeCookies("token");
        navigate("/");
      }
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setNewUsername(profile.username);
    setNewFirstName(profile.firstName);
    setNewLastName(profile.lastName);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleSavePasswordChanges = async () => {
    // Handle password change logic here
    try {
      console.log("Changing password...");
      const response = await axios.put(
        `${backend_url}/users/change-password?_id=${localStorage.getItem(
          "userId"
        )}`,
        {
          oldPassword,
          newPassword,
          confirmNewPassword,
        },
        { withCredentials: true }
      );
      console.log(response);
      setShowPasswordModal(false);
    } catch (error) {
      if (error.response.status == 403) {
        removeCookies("token");
        navigate("/");
      } else if (error.response.status == 400) alert("Something Went Wrong");
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className={`test ${localStorage.getItem("theme-color")}`}>
      <AppNavBar />
      <div class="page-background">
        <Container>
          <Card
            className={`mx-auto disableHover ${localStorage.getItem(
              "theme-color"
            )}`}
            style={{ maxWidth: "600px" }}
          >
            <Card.Body style={{ paddingTop: "50px" }}>
              <Card.Title className="mb-4 text-center">Profile</Card.Title>
              <Row className="mb-2">
                <div className="d-flex justify-content-between">
                  <Col xs={6}>
                    <strong>Email:</strong>
                  </Col>
                  <Col xs={6} className="text-truncate">
                    {email}
                  </Col>
                </div>
              </Row>
              <Row className="mb-2">
                <div className="d-flex justify-content-between">
                  <Col xs={6}>
                    <strong>Username:</strong>
                  </Col>
                  <Col xs={6} className="text-truncate">
                    {profile.username}
                  </Col>
                </div>
              </Row>
              <Row className="mb-2">
                <div className="d-flex justify-content-between">
                  <Col xs={6}>
                    <strong>First Name:</strong>
                  </Col>
                  <Col xs={6} className="text-truncate">
                    {profile.firstName}
                  </Col>
                </div>
              </Row>
              <Row className="mb-2">
                <div className="d-flex justify-content-between">
                  <Col xs={6}>
                    <strong>Last Name:</strong>
                  </Col>
                  <Col xs={6} className="text-truncate">
                    {profile.lastName}
                  </Col>
                </div>
              </Row>
              <Row className="mb-2">
                <Col xs={12} className="d-flex justify-content-center">
                  <Button variant="primary" onClick={handleEditProfile}>
                    Edit Profile
                  </Button>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={12} className="d-flex justify-content-center">
                  <Button variant="danger" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>

        {/* Edit Profile Modal */}
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="newUsername">
                <Form.Label>New Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newFirstName">
                <Form.Label>New First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new first name"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newLastName">
                <Form.Label>New Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new last name"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Change Password Modal */}
        <Modal show={showPasswordModal} onHide={handleClosePasswordModal}>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="oldPassword">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="confirmNewPassword">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePasswordModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePasswordChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
