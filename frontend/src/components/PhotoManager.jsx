import { useState, useRef } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Image, Trash2, Plus, Loader2 } from "lucide-react";

export default function PhotoManager({ 
  linkedType = "note", 
  linkedId = "", 
  photos = [], 
  onPhotosChange,
  maxPhotos = 10
}) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [photoData, setPhotoData] = useState({});
  const fileInputRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);
    const uploadedPhotos = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${API}/photos?linked_type=${linkedType}&linked_id=${linkedId}`,
          formData,
          { 
            headers: { 
              ...headers,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        uploadedPhotos.push(response.data.id);
        toast.success(`Uploaded: ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload: ${file.name}`);
        console.error(error);
      }
    }

    if (uploadedPhotos.length > 0 && onPhotosChange) {
      onPhotosChange([...photos, ...uploadedPhotos]);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async (photoId) => {
    try {
      await axios.delete(`${API}/photos/${photoId}`, { headers });
      if (onPhotosChange) {
        onPhotosChange(photos.filter(id => id !== photoId));
      }
      toast.success("Photo removed");
    } catch (error) {
      toast.error("Failed to remove photo");
    }
  };

  const loadPhotoData = async (photoId) => {
    if (photoData[photoId]) {
      setViewingPhoto({ id: photoId, ...photoData[photoId] });
      return;
    }

    try {
      const response = await axios.get(`${API}/photos/${photoId}`, { headers });
      const data = response.data;
      setPhotoData(prev => ({ ...prev, [photoId]: data }));
      setViewingPhoto(data);
    } catch (error) {
      toast.error("Failed to load photo");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Photos ({photos.length}/{maxPhotos})
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          data-testid="photo-file-input"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
          data-testid="add-photo-btn"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-1" />
          )}
          Add Photo
        </Button>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photoId, index) => (
            <div 
              key={photoId} 
              className="relative aspect-square bg-muted rounded-sm overflow-hidden group cursor-pointer"
              onClick={() => loadPhotoData(photoId)}
            >
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(photoId);
                  }}
                  data-testid={`remove-photo-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted rounded-sm p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to add job photos
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG or WebP (max 5MB each)
          </p>
        </div>
      )}

      {/* Photo Viewer Dialog */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">
              {viewingPhoto?.file_name || "Photo"}
            </DialogTitle>
          </DialogHeader>
          {viewingPhoto?.file_data && (
            <div className="relative">
              <img
                src={`data:${viewingPhoto.file_type};base64,${viewingPhoto.file_data}`}
                alt={viewingPhoto.file_name}
                className="w-full h-auto max-h-[60vh] object-contain rounded-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Size: {(viewingPhoto.file_size / 1024).toFixed(1)} KB | 
                Uploaded: {new Date(viewingPhoto.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
