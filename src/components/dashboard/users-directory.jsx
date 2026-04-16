'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminUsersDirectory } from '@/store/slices/dashboardSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Filter, CheckCircle, XCircle } from "lucide-react";
import Loading from "@/components/loading";

export default function UsersDirectory() {
  const dispatch = useDispatch();
  const { unifiedUsers, usersLoading } = useSelector((state) => state.dashboard);
  const user = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [paidFilter, setPaidFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAdminUsersDirectory(user.id));
    }
  }, [user?.id, dispatch]);

  const filteredUsers = useMemo(() => {
    if (!unifiedUsers) return [];
    return unifiedUsers.filter((u) => {
      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = roleFilter === "ALL" || u.role.toUpperCase() === roleFilter.toUpperCase();
      
      let matchPaid = true;
      if (paidFilter === "PAID") matchPaid = u.isPaid === true;
      if (paidFilter === "UNPAID") matchPaid = u.isPaid === false;
      
      return matchSearch && matchRole && matchPaid;
    });
  }, [unifiedUsers, searchTerm, roleFilter, paidFilter]);

  if (usersLoading) return <div className="h-64 flex items-center justify-center"><Loading /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-6 p-8">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Users Directory</CardTitle>
            <CardDescription className="text-base text-gray-500 mt-1">
              Manage and view all platform users, track subscriptions and statuses.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 rounded-full bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[140px] rounded-full">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="PARENT">Parent</SelectItem>
                <SelectItem value="ARTIST">Artist</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="BABYSITTER">Babysitter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paidFilter} onValueChange={setPaidFilter}>
              <SelectTrigger className="w-full sm:w-[140px] rounded-full">
                <DollarSignIcon className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid Only</SelectItem>
                <SelectItem value="UNPAID">Free/Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="pl-8 font-semibold">User</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center">Plan</TableHead>
                <TableHead className="font-semibold text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center space-x-4">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} alt={u.name} className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                          {u.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${u.role === 'Parent' ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : ''}
                      ${u.role === 'Artist' ? 'text-purple-600 bg-purple-50 border-purple-200' : ''}
                      ${u.role === 'Supplier' ? 'text-orange-600 bg-orange-50 border-orange-200' : ''}
                      ${u.role === 'Doctor' ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}
                      ${u.role === 'Babysitter' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : ''}
                    `}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {u.status === 'ACTIVE' || u.isVerified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none"><CheckCircle className="w-3 h-3 mr-1"/> Active</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-none"><XCircle className="w-3 h-3 mr-1"/> Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {u.isPaid ? (
                      <Badge className="bg-green-100 text-green-700 border-none"><span className="font-bold">$5</span> Paid</Badge>
                    ) : u.role === 'Parent' ? (
                      <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200">Free Tier</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 bg-red-50 border-red-200">Unpaid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white p-8 rounded-3xl">
                        <DialogHeader>
                          <div className="flex items-center space-x-4 mb-4">
                            {u.profilePicture ? (
                              <img src={u.profilePicture} alt={u.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                                {u.name?.charAt(0) || '?'}
                              </div>
                            )}
                            <div>
                              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {u.name}
                                {u.isVerified && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                              </DialogTitle>
                              <p className="text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-2 gap-6 mt-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-medium">Role</p>
                            <p className="font-semibold text-gray-800">{u.role}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-medium">Joined On</p>
                            <p className="font-semibold text-gray-800">{new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-medium">Subscription</p>
                            <p className="font-semibold text-gray-800">{u.isPaid ? 'Paid ($5)' : 'Unpaid'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                            <p className="font-semibold text-gray-800">{u.phone || 'N/A'}</p>
                          </div>
                          
                          {/* Doctor Specific */}
                          {u.role === 'Doctor' && (
                            <>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-500 font-medium">Specialty</p>
                                <p className="font-semibold text-gray-800">{u.details?.specialty || 'N/A'}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-500 font-medium">Consultation Fee</p>
                                <p className="font-semibold text-gray-800">${u.details?.consultationFee || 0}</p>
                              </div>
                            </>
                          )}

                          {/* Babysitter Specific */}
                          {u.role === 'Babysitter' && (
                            <>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-500 font-medium">Experience</p>
                                <p className="font-semibold text-gray-800">{u.details?.experience || 0} years</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-500 font-medium">Age Groups</p>
                                <p className="font-semibold text-gray-800">{u.details?.ageGroups?.join(', ') || 'N/A'}</p>
                              </div>
                            </>
                          )}
                          
                          {/* Supplier Specific */}
                          {u.role === 'Supplier' && (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500 font-medium">Tax ID</p>
                              <p className="font-semibold text-gray-800">{u.details?.taxId || 'N/A'}</p>
                            </div>
                          )}

                        </div>
                        
                        {u.details?.bio && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 font-medium mb-1">Bio</p>
                            <p className="text-gray-700 text-sm">{u.details.bio}</p>
                          </div>
                        )}
                        
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500 italic">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const DollarSignIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
