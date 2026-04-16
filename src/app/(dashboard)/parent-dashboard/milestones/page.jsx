"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllMilestonesWithSubForChild,
  toggleMilestoneAchieved
} from "@/store/slices/milestoneSlice";
import Loading from "@/components/loading";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ParentHeader from "@/components/layout/header/parent-header";
import MilestoneCard from "@/components/milestone/card"

export default function Milestones() {
  const milestones = useSelector((state) => state.milestone.milestones);
  console.log(milestones, "milestones");
  const user = useSelector((state) => state.auth.user);
  const childId = useSelector((state) => state.child.childId);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [statusForm, setStatusForm] = useState({
    date: "",
    note: "",
    status: "",
    time: ""
  })
  const [isSumbitMilestoneOpen, setIsSumbitMilestoneOpen] = useState(false);
  const [milestoneId, setMilestoneId] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();

  const gettingAllMilestones = () => {
    dispatch(getAllMilestonesWithSubForChild({ setLoading, parentId: user.id, childId }));
  };

  useEffect(() => {
    gettingAllMilestones();
  }, []);

  const handleToggleAchieve = async (e) => {
    if (statusForm.status) {
      e.preventDefault();
    }
    const body = {
      achieved: statusForm.status,
      achievedAt: statusForm.date,
      note: statusForm.note
    }
    dispatch(toggleMilestoneAchieved({ setLoading, parentId: user?.id, childId, subMilestoneId: milestoneId, body }))
    setStatusForm({
      status: "",
      date: "",
      note: "",
    });
    setMilestoneId(null);
    setIsSumbitMilestoneOpen(false);
  }

  function handleEditMilestone(milestone, e) {
    if (e) e.stopPropagation()
    setMilestoneDialog({ open: true, mode: "edit", milestone })
  }

  function handleDeleteMilestone(id, e) {
    if (e) e.stopPropagation()
    // setMilestones((list) => list.filter((m) => m.id !== id))
    dispatch(deleteMilestone({ setLoading, milestoneId: id, adminId: user?.id }))
  }

  function handleAddSubMilestone(parentId, e) {
    if (e) e.stopPropagation()
    setSubDialog({ open: true, parentId, mode: "add", subMilestone: null })
  }

  function handleEditSubMilestone(parentId, sub, e) {
    if (e) e.stopPropagation()
    setSubDialog({ open: true, parentId, mode: "edit", subMilestone: sub })
  }

  function handleDeleteSubMilestone(parentId, subId, e) {
    if (e) e.stopPropagation()
    dispatch(deleteSubMilestone({ setLoading, milestoneId: parentId, subId, adminId: user?.id }))
  }

  function handleShowMileStatus(e, status, id) {
    e.preventDefault();
    console.log(id, 'milestone Id')
    setStatusForm({ ...statusForm, status: status });
    setMilestoneId(id);
    if (status) {
      setIsSumbitMilestoneOpen(true);
    }
  }

  useEffect(() => {
    console.log(milestoneId, 'milestoneId')
    if (!statusForm.status && statusForm.status === false) {
      handleToggleAchieve();
    }
  }, [milestoneId, statusForm]);

  return (
    <div className="min-h-screen w-screen bg-background">
      {loading && <Loading />}
      <ParentHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Add Milestone Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Milestones
            </h2>
            <p className="text-sm text-muted-foreground">
              {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <section className="rounded-lg border">
          <Table>
            <TableCaption className="sr-only">Milestone list</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Month</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <MilestoneCard miles={milestones} handleEditMilestone={handleEditMilestone} handleDeleteMilestone={handleDeleteMilestone} handleAddSubMilestone={handleAddSubMilestone} handleEditSubMilestone={handleEditSubMilestone} handleDeleteSubMilestone={handleDeleteSubMilestone} parent={true} handleShowMileStatus={handleShowMileStatus} />
            </TableBody>
          </Table>
        </section>

        <Dialog open={isSumbitMilestoneOpen} onOpenChange={setIsSumbitMilestoneOpen}>
          <DialogTrigger asChild>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select date & time</DialogTitle>
              {/* <DialogDescription className="text-sm text-muted-foreground">
                It's an optional step. You can simply click on submit to continue.
              </DialogDescription> */}
            </DialogHeader>


            <form className="grid gap-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={statusForm.date}
                    onChange={(e) => setStatusForm({ ...statusForm, date: e.target.value })}
                  />
                </div>


                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={statusForm.time}
                    onChange={(e) => setStatusForm({ ...statusForm, time: e.target.value })}
                    placeholder="--:--"
                  />
                </div>
              </div>


              <div>
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={statusForm.note}
                  onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                  placeholder="Add an optional note..."
                  className="min-h-[88px]"
                />
              </div>


              <DialogFooter>
                <div className="flex w-full items-center justify-end gap-2">
                  <Button variant="outline" className="cursor-pointer" onClick={() => setIsSumbitMilestoneOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="cursor-pointer"
                    onClick={handleToggleAchieve}
                  >
                    Submit
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Empty State (if no milestones) */}
        {milestones?.length === 0 && !loading && (
          <div className="text-center py-16">
            <h2>No Milestone Found</h2>
          </div>
        )}
      </div>
    </div>
  );
}
