"use client";

import React, { useState } from "react";
import styles from "./teachers.module.css";
import { useSession } from "next-auth/react";
import { NextPage } from "next";

// Define teacher type
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  classes: string[];
}

// Sample data
const initialTeachers: Teacher[] = [
  {
    id: "1",
    firstName: "David",
    lastName: "Cohen",
    role: "Math Teacher",
    classes: ["10A", "11B", "12C"]
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Levi",
    role: "Science Teacher",
    classes: ["9A", "10B"]
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Goldberg",
    role: "English Teacher",
    classes: ["11A", "12A", "12B"]
  },
  {
    id: "4",
    firstName: "Rachel",
    lastName: "Stern",
    role: "History Teacher",
    classes: ["9B", "10C", "11C"]
  }
];

const TeachersPage: NextPage = () => {
  // State for teachers list
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    classes: ""
  });

  // useSession to access the user data and protect the page
  const { data: session, status } = useSession({
    required: true,
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new teacher object
    const newTeacher: Teacher = {
      id: Date.now().toString(), // Simple ID generation
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
      classes: formData.classes.split(',').map(cls => cls.trim()) // Convert comma-separated string to array
    };
    
    // Add new teacher to the list
    setTeachers(prev => [...prev, newTeacher]);
    
    // Reset form and close modal
    setFormData({
      firstName: "",
      lastName: "",
      role: "",
      classes: ""
    });
    setIsModalOpen(false);
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Teachers</h1>
          <button 
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Teacher
          </button>
        </div>
        
        {/* Teachers Table */}
        <table className={styles.teachersList}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Classes</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.firstName}</td>
                <td>{teacher.lastName}</td>
                <td>{teacher.role}</td>
                <td>{teacher.classes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Teacher</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="classes">Classes (comma-separated)</label>
                <input
                  type="text"
                  id="classes"
                  name="classes"
                  value={formData.classes}
                  onChange={handleChange}
                  placeholder="e.g. 10A, 11B, 12C"
                  required
                />
              </div>
              
              <button type="submit" className={styles.submitButton}>
                Add Teacher
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
