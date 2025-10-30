'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useRoomStore } from '../../../store/useRoomStore';
import { sheetsApi, roomsApi, Room } from '../../../lib/api';
import { toast } from 'sonner';
import SearchBar from '../../../components/SearchBar';
import Pagination from '../../../components/Pagination';
import FilterBar, { FilterOption } from '../../../components/FilterBar';
import ConfirmDialog from '../../../components/ConfirmDialog';
import RowsPerPageSelector from '../../../components/RowsPerPageSelector';

export default function RoomsDashboard() {
  const { sheets, setSheets } = useRoomStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    gender: '',
    status: '',
    sheet: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    sheetId: '',
  });

  // Filtered and paginated data
  const filteredRooms = useMemo(() => {
    let filtered = rooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = !filters.gender || room.gender === filters.gender;
      const matchesStatus = !filters.status || 
        (filters.status === 'full' && room.members.length >= room.capacity) ||
        (filters.status === 'available' && room.members.length < room.capacity);
      const matchesSheet = !filters.sheet || room.sheetId === filters.sheet;

      return matchesSearch && matchesGender && matchesStatus && matchesSheet;
    });

    return filtered;
  }, [rooms, searchQuery, filters]);

  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRooms, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Filter options
  const filterOptions = useMemo(() => [
    {
      label: 'All Genders',
      key: 'gender',
      options: [
        { label: 'Male', value: 'MALE' },
        { label: 'Female', value: 'FEMALE' }
      ]
    },
    {
      label: 'All Status',
      key: 'status',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Full', value: 'full' }
      ]
    },
    {
      label: 'All Sheets',
      key: 'sheet',
      options: sheets.map(sheet => ({
        label: sheet.name,
        value: sheet.id
      }))
    }
  ], [sheets]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [sheetsResponse, roomsResponse] = await Promise.all([
          sheetsApi.getAll(),
          roomsApi.getAll(),
        ]);
        setSheets(sheetsResponse.data);
        setRooms(roomsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setSheets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await roomsApi.create({
        name: formData.name,
        capacity: parseInt(formData.capacity),
        gender: formData.gender,
        sheetId: formData.sheetId,
      });
      setRooms([...rooms, response.data]);
      setCreateModalOpen(false);
      setFormData({ name: '', capacity: '', gender: 'MALE', sheetId: '' });
      toast.success('Room created successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create room';
      toast.error(message);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      const response = await roomsApi.update(selectedRoom.id, {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        gender: formData.gender,
      });
      setRooms(rooms.map(room => room.id === selectedRoom.id ? response.data : room));
      setEditModalOpen(false);
      setSelectedRoom(null);
      setFormData({ name: '', capacity: '', gender: 'MALE', sheetId: '' });
      toast.success('Room updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update room';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    
    try {
      await roomsApi.delete(selectedRoom.id);
      setRooms(rooms.filter(r => r.id !== selectedRoom.id));
      toast.success('Room deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete room';
      toast.error(message);
    }
  };

  const openDeleteModal = (room: Room) => {
    setSelectedRoom(room);
    setDeleteModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      gender: room.gender,
      sheetId: room.sheetId,
    });
    setEditModalOpen(true);
  };

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'bg-blue-100 text-blue-800';
      case 'FEMALE':
        return 'bg-pink-100 text-pink-800';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rooms Management</h1>
            <p className="text-gray-600">Manage all rooms and their configurations</p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <select
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => 
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select capacity</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5">5 people</option>
                    <option value="6">6 people</option>
                    <option value="7">7 people</option>
                    <option value="8">8 people</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => 
                      setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>

                  </select>
                </div>
                <div>
                  <Label htmlFor="sheetId">Sheet</Label>
                  <select
                    id="sheetId"
                    value={formData.sheetId}
                    onChange={(e) => 
                      setFormData({ ...formData, sheetId: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a sheet</option>
                    {sheets.map((sheet) => (
                      <option key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Room</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Rooms ({filteredRooms.length} of {rooms.length})</span>
              <RowsPerPageSelector
                value={itemsPerPage}
                onChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
                className="shrink-0"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search rooms by name..."
                  onSearch={setSearchQuery}
                  className="w-full"
                />
              </div>
            </div>
            
            <FilterBar
              filters={filterOptions}
              activeFilters={filters}
              onFilterChange={(key, value) => {
                setFilters(prev => ({ ...prev, [key]: value }));
                setCurrentPage(1); // Reset to first page when filtering
              }}
              onClearFilter={(key) => {
                setFilters(prev => ({ ...prev, [key]: '' }));
                setCurrentPage(1);
              }}
              onClearAll={() => {
                setFilters({ gender: '', status: '', sheet: '' });
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {/* Responsive table container */}
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-32">Room Name</TableHead>
                    <TableHead className="min-w-24">Sheet</TableHead>
                    <TableHead className="min-w-20">Gender</TableHead>
                    <TableHead className="min-w-20">Capacity</TableHead>
                    <TableHead className="min-w-28">Members</TableHead>
                    <TableHead className="min-w-24">Status</TableHead>
                    <TableHead className="min-w-24">Occupancy</TableHead>
                    <TableHead className="min-w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchQuery || Object.values(filters).some(f => f) 
                          ? 'No rooms match your search criteria'
                          : 'No rooms found'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRooms.map((room) => {
                      const roomSheet = sheets.find(sheet => sheet.id === room.sheetId);
                      return (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {roomSheet?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getGenderBadgeColor(room.gender)}>
                              {room.gender}
                            </Badge>
                          </TableCell>
                          <TableCell>{room.capacity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {room.members.length}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={room.members.length >= room.capacity ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {room.members.length >= room.capacity ? 'Full' : 'Available'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {Math.round((room.members.length / room.capacity) * 100)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(room)}
                                aria-label={`Edit room ${room.name}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteModal(room)}
                                disabled={room.members.length > 0}
                                aria-label={`Delete room ${room.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {paginatedRooms.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRooms.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Room Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-capacity">Capacity</Label>
                <select
                  id="edit-capacity"
                  value={formData.capacity}
                  onChange={(e) => 
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select capacity</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5 people</option>
                  <option value="6">6 people</option>
                  <option value="7">7 people</option>
                  <option value="8">8 people</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-gender">Gender</Label>
                <select
                  id="edit-gender"
                  value={formData.gender}
                  onChange={(e) => 
                    setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>

                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Room"
          description={
            selectedRoom 
              ? `Are you sure you want to delete "${selectedRoom.name}"? This action cannot be undone.${
                  selectedRoom.members.length > 0 
                    ? ` This room currently has ${selectedRoom.members.length} member(s). Please remove all members first.`
                    : ''
                }`
              : ''
          }
          onConfirm={handleDelete}
          confirmText="Delete Room"
          isDestructive={true}
          disabled={selectedRoom ? selectedRoom.members.length > 0 : true}
        />
      </div>
    </DashboardLayout>
  );
}