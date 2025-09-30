import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const GradeDistributionChart = ({ submissions }) => {
  // Calculate grade distribution buckets
  const buckets = {
    '0-59': 0,
    '60-69': 0,
    '70-79': 0,
    '80-89': 0,
    '90-100': 0,
  };

  submissions.forEach(sub => {
    const grade = Number(sub.grade);
    if (!isNaN(grade)) {
      if (grade < 60) buckets['0-59']++;
      else if (grade < 70) buckets['60-69']++;
      else if (grade < 80) buckets['70-79']++;
      else if (grade < 90) buckets['80-89']++;
      else buckets['90-100']++;
    }
  });

  const data = Object.keys(buckets).map(key => ({
    range: key,
    count: buckets[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#1976d2" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GradeDistributionChart;
