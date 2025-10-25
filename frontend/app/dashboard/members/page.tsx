'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Trash2, Users, Building } from 'lucide-react';
import { membersApi, roomsApi, RoomMember } from '../../../lib/api';
import { toast } from 'sonner';
import SearchBar from '../../../components/SearchBar';
import Pagination from '../../../components/Pagination';
import FilterBar from '../../../components/FilterBar';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function MembersDashboard() {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<RoomMember | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    gender: '',
    sheet: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await membersApi.getAll();
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    try {
      await roomsApi.removeMember(selectedMember.roomId, selectedMember.id);
      setMembers(members.filter(m => m.id !== selectedMember.id));
      toast.success('Member removed successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove member';
      toast.error(message);
    }
  };

  const openDeleteModal = (member: RoomMember) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
  };

  // Filtered and paginated data
  const filteredMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const fullName = `${member.user.firstname} ${member.user.lastname}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
        member.room?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = !filters.gender || member.room?.gender === filters.gender;
      const matchesSheet = !filters.sheet || member.room?.sheetId === filters.sheet;

      return matchesSearch && matchesGender && matchesSheet;
    });

    return filtered;
  }, [members, searchQuery, filters]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  // Filter options
  const filterOptions = useMemo(() => {
    const uniqueSheets = Array.from(
      new Set(members.map(m => m.room?.sheet).filter(Boolean))
    ) as any[];

    return [
      {
        label: 'All Genders',
        key: 'gender',
        options: [
          { label: 'Male', value: 'MALE' },
          { label: 'Female', value: 'FEMALE' },
          { label: 'Mixed', value: 'MIXED' }
        ]
      },
      {
        label: 'All Sheets',
        key: 'sheet',
        options: uniqueSheets.map(sheet => ({
          label: sheet?.name || 'Unknown',
          value: sheet?.id || ''
        }))
      }
    ];
  }, [members]);

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'bg-blue-100 text-blue-800';
      case 'FEMALE':
        return 'bg-pink-100 text-pink-800';
      case 'MIXED':
        return 'bg-purple-100 text-purple-800';
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members Management</h1>
          <p className="text-gray-600">View and manage all members across rooms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Rooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(members.map(m => m.roomId)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Joins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => {
                  const joinDate = new Date(m.joinedAt);
                  const now = new Date();
                  const diffHours = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60);
                  return diffHours <= 24;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              All Members ({filteredMembers.length} of {members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search members by name or room..."
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
                setFilters({ gender: '', sheet: '' });
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
                  <TableHead>Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Sheet</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchQuery || Object.values(filters).some(f => f) 
                        ? 'No members match your search criteria'
                        : 'No members found'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.user.firstname} {member.user.lastname}
                    </TableCell>
                    <TableCell>{member.room?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge className={getGenderBadgeColor(member.room?.gender || 'MIXED')}>
                        {member.room?.gender || 'MIXED'}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.room?.sheet?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(member)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {paginatedMembers.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredMembers.length}
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Remove Member"
          description={
            selectedMember 
              ? `Are you sure you want to remove "${selectedMember.user.firstname} ${selectedMember.user.lastname}" from "${selectedMember.room?.name}"? This action cannot be undone.`
              : ''
          }
          onConfirm={handleRemoveMember}
          confirmText="Remove Member"
          isDestructive={true}
        />
      </div>
    </DashboardLayout>
  );
}