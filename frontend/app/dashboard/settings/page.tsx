'use client';

import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Building, Users, Database, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Application configuration and system information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Frontend Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backend Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium">MySQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Real-time:</span>
                <span className="font-medium">Socket.IO</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tables:</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Migration Status:</span>
                <span className="font-medium text-green-600">Up to date</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium">Room Management</h3>
                  <p className="text-sm text-gray-600">Create and manage rooms with capacity limits</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-medium">Member Management</h3>
                  <p className="text-sm text-gray-600">Track users and room memberships</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Database className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-medium">Sheet Organization</h3>
                  <p className="text-sm text-gray-600">Organize rooms into sheets</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <SettingsIcon className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="font-medium">Real-time Updates</h3>
                  <p className="text-sm text-gray-600">Live synchronization via WebSockets</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}