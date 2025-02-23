'use client';

import React, { useState, useEffect } from 'react';
import { Download, Github, Instagram, Linkedin, RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import './globals.css'

interface Course {
  name: string;
  credits: number;
  grade: string;
}

const gradePoints = {
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 7,
  'C': 6,
  'D': 5,
  'F': 0,
} as const;

const STORAGE_KEY = 'sgpaCalculatorData';

const SGPACalculator = () => {
  const [numCourses, setNumCourses] = useState<number>(1);
  const [courses, setCourses] = useState<Course[]>([
    { name: '', credits: 0, grade: 'A+' }
  ]);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as Course[];
      setCourses(parsedData);
      setNumCourses(parsedData.length);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  const handleNumCoursesChange = (newValue: number) => {
    const value = Math.max(1, Math.min(20, newValue));
    setNumCourses(value);
    setCourses(Array(value).fill(null).map((_, i) =>
      courses[i] || { name: '', credits: 0, grade: 'A+' }
    ));
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string | number) => {
    const newCourses = [...courses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setCourses(newCourses);
  };

  const removeCourse = (index: number) => {
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
    setNumCourses(newCourses.length);
  };

  const addCourse = () => {
    if (numCourses < 10) {
      setCourses([...courses, { name: '', credits: 0, grade: 'A+' }]);
      setNumCourses(numCourses + 1);
    }
  };

  const calculateSGPA = (): number => {
    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach(course => {
      const credits = Number(course.credits) || 0;
      const gradePoint = gradePoints[course.grade as keyof typeof gradePoints] || 0;
      totalCredits += credits;
      totalPoints += credits * gradePoint;
    });

    return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
  };

  const calculatePercentage = (): string => {
    const sgpa = calculateSGPA();
    return (sgpa * 9.5).toFixed(2);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('SGPA Mark Sheet', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const headers = ['Course Name', 'Credits', 'Grade', 'Grade Point'];
    let y = 40;
    
    doc.setLineWidth(0.2);
    doc.line(20, y-5, 190, y-5);
    headers.forEach((header, i) => {
      doc.text(header, 25 + (i * 45), y);
    });
    doc.line(20, y+2, 190, y+2);
    
    y += 15;
    courses.forEach((course, i) => {
      doc.text(course.name || '-', 25, y + (i * 10));
      doc.text(String(course.credits) || '-', 70, y + (i * 10));
      doc.text(course.grade || '-', 115, y + (i * 10));
      doc.text(String(gradePoints[course.grade as keyof typeof gradePoints]) || '-', 160, y + (i * 10));
    });
    
    y += courses.length * 10 + 20;
    doc.text(`SGPA: ${calculateSGPA()}`, 25, y);
    doc.text(`Percentage: ${calculatePercentage()}%`, 25, y + 10);
    
    doc.save('marksheet.pdf');
  };

  const getGradePoint = (grade: string): number => {
    return gradePoints[grade as keyof typeof gradePoints] || 0;
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCourses([{ name: '', credits: 0, grade: 'A+' }]);
    setNumCourses(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <header className="bg-gray-900 p-3 text-center flex justify-between items-center sticky top-0 z-20 border-b border-gray-800">
        <h1 className="text-xl font-bold">SGPA Calculator</h1>
        <button
          onClick={clearData}
          className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw size={16} />
          Clear Data
        </button>
      </header>

      <main className="flex-1 container mx-auto p-3 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3 mb-4 lg:mb-0 bg-gray-900 p-4 rounded-lg shadow-md sticky top-20">
          <h2 className="text-lg font-bold mb-3">Mark Summary</h2>
          <div className="mb-1 text-sm">SGPA: {calculateSGPA()}</div>
          <div className="mb-2 text-sm">Percentage: {calculatePercentage()}%</div>
          <button
            onClick={generatePDF}
            className="w-full px-3 py-1 bg-red-600 rounded hover:bg-red-700 flex items-center justify-center gap-2 text-white text-sm"
          >
            <Download size={18} />
            Save as PDF
          </button>
        </div>

        <div className="lg:w-2/3 bg-gray-900 p-4 rounded-lg shadow-md border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <label className="whitespace-nowrap text-sm">Courses:</label>
            <input
              type="number"
              value={numCourses}
              onChange={(e) => handleNumCoursesChange(parseInt(e.target.value))}
              min="1"
              className="w-16 px-2 py-1 bg-gray-800 rounded border border-gray-800 text-gray-100 text-sm"
            />
            <button
              onClick={addCourse}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
            >
              Add Course
            </button>
          </div>

          <div className="overflow-x-auto text-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-2">Course Name</th>
                  <th className="text-left p-2">Credits</th>
                  <th className="text-left p-2">Grade</th>
                  <th className="text-left p-2">Grade Point</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="p-1">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                        placeholder="Course Name"
                        className="w-full bg-gray-800 p-1 rounded border border-gray-800 text-gray-100 text-sm"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={course.credits}
                        onChange={(e) => handleCourseChange(index, 'credits', parseInt(e.target.value))}
                        className="w-16 bg-gray-800 p-1 rounded border border-gray-800 text-gray-100 text-sm"
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={course.grade}
                        onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                        className="w-20 bg-gray-800 p-1 rounded border border-gray-800 text-gray-100 text-sm"
                      >
                        {Object.keys(gradePoints).map((gradeOption) => (
                          <option key={gradeOption} value={gradeOption}>{gradeOption}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={getGradePoint(course.grade)}
                        readOnly
                        className="w-16 bg-gray-800 p-1 rounded text-center border border-gray-800 text-gray-100 text-sm"
                      />
                    </td>
                    <td className="p-1">
                      <button
                        onClick={() => removeCourse(index)}
                        className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 p-3 text-center text-gray-300 border-t border-gray-800 sticky bottom-0 z-20">
        <div className="mb-2 text-sm">Copyright 2025 Nilambar Elangbam</div>
        <div className="flex justify-center gap-3">
          <a href="https://github.com" className="hover:text-gray-100">
            <Github size={20} />
          </a>
          <a href="https://instagram.com" className="hover:text-gray-100">
            <Instagram size={20} />
          </a>
          <a href="https://linkedin.com" className="hover:text-gray-100">
            <Linkedin size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SGPACalculator;