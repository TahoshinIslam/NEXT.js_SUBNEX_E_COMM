"use client";

import { useState } from "react";
import { Testimonial } from "@prisma/client";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { createTestimonial, updateTestimonial, deleteTestimonial, toggleTestimonialActive } from "@/app/actions/testimonials";
import { useToast } from "@/hooks/use-toast";

interface Props {
  testimonials: Testimonial[];
  orgId: string;
}

export function TestimonialsClient({ testimonials, orgId }: Props) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    text: "",
    rating: 5,
  });

  const resetForm = () => {
    setFormData({ name: "", location: "", text: "", rating: 5 });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (t: Testimonial) => {
    setFormData({
      name: t.name,
      location: t.location || "",
      text: t.text,
      rating: t.rating,
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTestimonial(editingId, formData);
        toast({ title: "Updated", description: "Testimonial updated successfully" });
      } else {
        await createTestimonial({ ...formData, orgId });
        toast({ title: "Created", description: "Testimonial created successfully" });
      }
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteTestimonial(id);
      toast({ title: "Deleted", description: "Testimonial deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleTestimonialActive(id, !current);
      toast({ title: "Updated", description: "Visibility updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
          <h2 className="font-semibold">All Reviews</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Review</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Visible</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </td>
                  <td className="px-6 py-4 max-w-[300px]">
                    <p className="truncate text-muted-foreground">{t.text}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-500 text-xs">
                      {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(t.id, t.isActive)}
                      className="transition-opacity hover:opacity-80"
                    >
                      {t.isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handleEdit(t)} className="text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No testimonials found. Add some to display on your store.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b">
              <h2 className="font-semibold text-lg">{editingId ? "Edit" : "Add"} Testimonial</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location (Optional)</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Text</label>
                <textarea
                  required
                  rows={4}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  {editingId ? "Save Changes" : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
