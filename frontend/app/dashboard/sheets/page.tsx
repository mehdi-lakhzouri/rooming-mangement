'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Plus, Edit, Trash2, Building, Users } from 'lucide-react';
import { useRoomStore } from '../../../store/useRoomStore';
import { sheetsApi, Sheet } from '../../../lib/api';
import { toast } from 'sonner';
import SearchBar from '../../../components/SearchBar';
import Pagination from '../../../components/Pagination';
import FilterBar from '../../../components/FilterBar';

export default function SheetsDashboard() {
  const { sheets, setSheets, addSheet, removeSheet } = useRoomStore();
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    status: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
  });

  // Filtered and paginated data
  const filteredSheets = useMemo(() => {
    let filtered = sheets.filter(sheet => {
      const matchesSearch = sheet.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filters.status || 
        (filters.status === 'empty' && sheet.rooms.length === 0) ||
        (filters.status === 'has-rooms' && sheet.rooms.length > 0);

      return matchesSearch && matchesStatus;
    });

    return filtered;
  }, [sheets, searchQuery, filters]);

  const paginatedSheets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSheets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSheets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSheets.length / itemsPerPage);

  // Filter options
  const filterOptions = useMemo(() => [
    {
      label: 'All Status',
      key: 'status',
      options: [
        { label: 'Has rooms', value: 'has-rooms' },
        { label: 'Empty', value: 'empty' }
      ]
    }
  ], []);

  useEffect(() => {
    const fetchSheets = async () => {
      setIsLoading(true);
      try {
        const response = await sheetsApi.getAll();
        setSheets(response.data);
      } catch (error) {
        console.error('Error fetching sheets:', error);
        toast.error('Failed to load sheets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSheets();
  }, [setSheets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await sheetsApi.create({
        name: formData.name,
      });
      addSheet(response.data);
      setCreateModalOpen(false);
      setFormData({ name: '' });
      toast.success('Sheet created successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create sheet';
      toast.error(message);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSheet) return;

    try {
      const response = await sheetsApi.update(selectedSheet.id, {
        name: formData.name,
      });
      const updatedSheets = sheets.map(sheet => 
        sheet.id === selectedSheet.id ? response.data : sheet
      );
      setSheets(updatedSheets);
      setEditModalOpen(false);
      setSelectedSheet(null);
      setFormData({ name: '' });
      toast.success('Sheet updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update sheet';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!selectedSheet) return;

    try {
      await sheetsApi.delete(selectedSheet.id);
      removeSheet(selectedSheet.id);
      setDeleteModalOpen(false);
      setSelectedSheet(null);
      toast.success('Sheet deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete sheet';
      toast.error(message);
    }
  };

  const openEditModal = (sheet: Sheet) => {
    setSelectedSheet(sheet);
    setFormData({
      name: sheet.name,
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (sheet: Sheet) => {
    setSelectedSheet(sheet);
    setDeleteModalOpen(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Sheets Management</h1>
            <p className="text-gray-600">Manage sheets that organize your rooms</p>
          </div>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Sheet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sheet</DialogTitle>
                <DialogDescription>
                  Create a new sheet to organize your rooms.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Sheet Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter sheet name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Sheet</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              All Sheets ({filteredSheets.length} of {sheets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search sheets by name..."
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
                setCurrentPage(1);
              }}
              onClearFilter={(key) => {
                setFilters(prev => ({ ...prev, [key]: '' }));
                setCurrentPage(1);
              }}
              onClearAll={() => {
                setFilters({ status: '' });
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sheet Name</TableHead>
                  <TableHead>Total Rooms</TableHead>
                  <TableHead>Total Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSheets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchQuery || Object.values(filters).some(f => f) 
                        ? 'No sheets match your search criteria'
                        : 'No sheets found'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSheets.map((sheet) => {
                  const totalMembers = sheet.rooms.reduce((sum, room) => sum + room.members.length, 0);
                  return (
                    <TableRow key={sheet.id}>
                      <TableCell className="font-medium">{sheet.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {sheet.rooms.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {totalMembers}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(sheet.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(sheet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteModal(sheet)}
                            disabled={sheet.rooms.length > 0}
                            className="text-red-600 hover:text-red-700"
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

            {paginatedSheets.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredSheets.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(newItemsPerPage) => {
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sheet</DialogTitle>
              <DialogDescription>
                Update the sheet name.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Sheet Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Sheet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Sheet</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedSheet?.name}"? This action cannot be undone.
                {selectedSheet?.rooms && selectedSheet.rooms.length > 0 && (
                  <span className="block mt-2 text-red-600">
                    This sheet contains {selectedSheet.rooms.length} room(s). Please move or delete all rooms first.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={selectedSheet?.rooms && selectedSheet.rooms.length > 0}
              >
                Delete Sheet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}