import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./updateprofile.css";
import BottomNavBar from "./BottomNavBar";

const UpdateProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        currentPassword: "",
        newPassword: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/signin");
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Update failed");
            }

            alert("Profile updated successfully!");
            navigate("/profile");
        } catch (error) {
            console.error("Update error:", error);
            setError(error.message || "An error occurred during updating");
        }
    };

    return (
        <div className="update-profile-container">
            <h2>Update Profile</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="update-profile-form" onSubmit={handleSubmit}>
                <label htmlFor="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" 
                       value={formData.firstName} onChange={handleChange} />

                <label htmlFor="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" 
                       value={formData.lastName} onChange={handleChange} />

                <label htmlFor="currentPassword">Current Password:</label>
                <input type="password" id="currentPassword" name="currentPassword" 
                       value={formData.currentPassword} onChange={handleChange} required />

                <label htmlFor="newPassword">New Password:</label>
                <input type="password" id="newPassword" name="newPassword" 
                       value={formData.newPassword} onChange={handleChange} />

                <button type="submit">Update</button>
            </form>
            <BottomNavBar />
        </div>
    );
};

export default UpdateProfile;