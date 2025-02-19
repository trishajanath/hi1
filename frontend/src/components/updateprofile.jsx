import React, { useState } from "react";
import "./updateprofile.css";
import { useNavigate } from "react-router-dom";
import BottomNavBar from "./BottomNavBar";

const UpdateProfile = () => {
    const navigate = useNavigate();

    // State for form data and error handling
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://127.0.0.1:8000/update-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json(); // Parse response

            if (!response.ok) {
                throw new Error(data.detail || "Update failed");
            }

            console.log("Updation successful:", data);
            alert("Update successful!");
            navigate("/signin");
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
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />

                <button type="submit">Update</button>
            </form>
            <BottomNavBar />
        </div>
    );
};

export default UpdateProfile;
