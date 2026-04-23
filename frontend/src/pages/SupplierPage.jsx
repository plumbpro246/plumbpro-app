import { useState, useEffect } from "react";
import { API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Phone, Globe, Tag, ExternalLink, Loader2, Store
} from "lucide-react";

const SUPPLIER_TYPES = ["All", "Wholesale", "Retail/Pro", "Online", "Industrial"];

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [nearbyUrl, setNearbyUrl] = useState(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (activeType !== "All") params.type = activeType;
      const res = await axios.get(`${API}/suppliers`, { params });
      setSuppliers(res.data);
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [activeType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers();
  };

  const findNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLoadingNearby(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await axios.get(`${API}/suppliers/nearby`, {
            params: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          });
          setNearbyUrl(res.data.maps_url);
          window.open(res.data.maps_url, "_blank");
        } catch {
          toast.error("Failed to find nearby suppliers");
        } finally {
          setLoadingNearby(false);
        }
      },
      () => {
        toast.error("Location access denied");
        setLoadingNearby(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6" data-testid="supplier-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight">Supplier Lookup</h1>
          <p className="text-muted-foreground text-sm">Find plumbing suppliers, wholesalers & stores</p>
        </div>
        <Button
          onClick={findNearby}
          disabled={loadingNearby}
          className="bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase"
          data-testid="find-nearby-btn"
        >
          {loadingNearby ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
          Find Nearby
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2" data-testid="supplier-search-form">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or specialty (e.g. PEX, water heaters)..."
            className="pl-10 h-12"
            data-testid="supplier-search-input"
          />
        </div>
        <Button type="submit" className="h-12 px-6 bg-[#FF5F00] hover:bg-[#FF5F00]/90 font-bold uppercase" data-testid="supplier-search-btn">
          Search
        </Button>
      </form>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2" data-testid="supplier-type-filters">
        {SUPPLIER_TYPES.map((type) => (
          <Button
            key={type}
            variant={activeType === type ? "default" : "outline"}
            size="sm"
            className={activeType === type ? "bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white font-bold uppercase" : "font-bold uppercase"}
            onClick={() => setActiveType(type)}
            data-testid={`filter-${type.toLowerCase().replace("/", "-")}`}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : suppliers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No suppliers found. Try a different search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="supplier-results">
          {suppliers.map((sup, i) => (
            <Card key={i} className="border border-border rounded-sm hover:border-[#FF5F00] transition-colors" data-testid={`supplier-card-${i}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{sup.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-muted text-xs font-bold uppercase rounded-sm">
                      {sup.type}
                    </span>
                  </div>
                  <Store className="w-8 h-8 text-[#FF5F00] flex-shrink-0" />
                </div>

                <div className="space-y-2 text-sm">
                  <a
                    href={`tel:${sup.phone}`}
                    className="flex items-center gap-2 text-foreground hover:text-[#FF5F00] transition-colors"
                    data-testid={`supplier-phone-${i}`}
                  >
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {sup.phone}
                  </a>
                  <a
                    href={sup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground hover:text-[#FF5F00] transition-colors"
                    data-testid={`supplier-website-${i}`}
                  >
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Visit Website
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {sup.specialties?.map((spec, j) => (
                    <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-xs rounded-sm">
                      <Tag className="w-3 h-3 opacity-60" />
                      {spec}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
