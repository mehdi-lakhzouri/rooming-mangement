'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Building, Users, Activity, TrendingUp, FileText, UserCheck, Percent, Layers } from 'lucide-react';
import { membersApi, sheetsApi } from '../../lib/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Analytics {
  totalMembers: number;
  totalRooms: number;
  totalCapacity: number;
  occupancyRate: number;
  roomsByGender: Array<{ gender: string; _count: { _all: number } }>;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [totalSheets, setTotalSheets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({
    rooms: 0,
    members: 0,
    capacity: 0,
    sheets: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsResponse, sheetsResponse] = await Promise.all([
          membersApi.getAnalytics(),
          sheetsApi.getAll(),
        ]);
        setAnalytics(analyticsResponse.data);
        setTotalSheets(sheetsResponse.data.length);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Animate numbers on load
  useEffect(() => {
    if (!analytics) return;

    const duration = 1000;
    const steps = 60;
    const increment = duration / steps;

    const targets = {
      rooms: analytics.totalRooms,
      members: analytics.totalMembers,
      capacity: analytics.totalCapacity,
      sheets: totalSheets,
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        rooms: Math.floor(targets.rooms * progress),
        members: Math.floor(targets.members * progress),
        capacity: Math.floor(targets.capacity * progress),
        sheets: Math.floor(targets.sheets * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets);
      }
    }, increment);

    return () => clearInterval(timer);
  }, [analytics, totalSheets]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const genderData = {
    labels: analytics?.roomsByGender.map(item => item.gender) || [],
    datasets: [
      {
        data: analytics?.roomsByGender.map(item => item._count._all) || [],
        backgroundColor: [
          '#3B82F6', // Blue for MALE
          '#EC4899', // Pink for FEMALE
          '#8B5CF6', // Purple for MIXED
        ],
      },
    ],
  };

  const occupancyData = {
    labels: ['Occupied', 'Available'],
    datasets: [
      {
        data: analytics ? [analytics.totalMembers, analytics.totalCapacity - analytics.totalMembers] : [],
        backgroundColor: ['#10B981', '#E5E7EB'],
      },
    ],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm md:text-base text-gray-600">Monitor your rooming system performance in real-time</p>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sheets Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500 animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-purple-50 to-white">
              <CardTitle className="text-sm font-medium text-gray-700">Total Sheets</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900 transition-all duration-300">
                {animatedValues.sheets}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active sheet configurations</p>
            </CardContent>
          </Card>

          {/* Rooms Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500 animate-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-blue-50 to-white">
              <CardTitle className="text-sm font-medium text-gray-700">Total Rooms</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900 transition-all duration-300">
                {animatedValues.rooms}
              </div>
              <p className="text-xs text-gray-500 mt-1">Rooms configured in system</p>
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-green-500 animate-in slide-in-from-bottom-4 duration-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-green-50 to-white">
              <CardTitle className="text-sm font-medium text-gray-700">Total Members</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900 transition-all duration-300">
                {animatedValues.members}
              </div>
              <p className="text-xs text-gray-500 mt-1">Members assigned to rooms</p>
            </CardContent>
          </Card>

          {/* Occupancy Rate Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-amber-500 animate-in slide-in-from-bottom-4 duration-1000">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-amber-50 to-white">
              <CardTitle className="text-sm font-medium text-gray-700">Occupancy Rate</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900 transition-all duration-300">
                {analytics?.occupancyRate || 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Current room utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{animatedValues.capacity}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Layers className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <span className="text-gray-500">Maximum capacity available</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Spots</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {analytics ? analytics.totalCapacity - analytics.totalMembers : 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <span className="text-gray-500">Spots remaining across all rooms</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Occupancy</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {analytics && analytics.totalRooms > 0 
                      ? Math.round((analytics.totalMembers / analytics.totalRooms) * 10) / 10
                      : 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <span className="text-gray-500">Average members per room</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                Rooms by Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-64 flex items-center justify-center">
                <Doughnut 
                  data={genderData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12,
                            weight: 'bold' as const,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        bodyFont: {
                          size: 14,
                        },
                      },
                    },
                    cutout: '65%',
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {analytics?.roomsByGender.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{item.gender}</span>
                    <span className="text-lg font-bold text-gray-900">{item._count._all}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                Occupancy Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="w-full h-64 flex items-center justify-center">
                <Doughnut 
                  data={occupancyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12,
                            weight: 'bold' as const,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        bodyFont: {
                          size: 14,
                        },
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = analytics?.totalCapacity || 0;
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      },
                    },
                    cutout: '65%',
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">Occupied</span>
                  <span className="text-lg font-bold text-green-900">{analytics?.totalMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Available</span>
                  <span className="text-lg font-bold text-gray-900">
                    {analytics ? analytics.totalCapacity - analytics.totalMembers : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <a
                href="/dashboard/sheets"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Manage Sheets</span>
              </a>
              <a
                href="/dashboard/rooms"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <Building className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Manage Rooms</span>
              </a>
              <a
                href="/dashboard/members"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <Users className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Manage Members</span>
              </a>
              <a
                href="/dashboard/settings"
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <TrendingUp className="h-5 w-5 text-amber-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">View Settings</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}