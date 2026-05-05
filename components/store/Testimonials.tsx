import { Star } from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";

interface TestimonialType {
  id: string;
  name: string;
  location: string | null;
  text: string;
  rating: number;
}

export function Testimonials({ testimonials }: { testimonials?: TestimonialType[] }) {
  // Fallback data if none provided or array is empty
  const defaultReviews = [
    {
      id: "1",
      name: "Rahim K.",
      location: "Dhaka",
      text: "Got my ChatGPT Plus within 2 hours. Super smooth process. Highly recommend!",
      rating: 5,
    },
    {
      id: "2",
      name: "Sarah M.",
      location: "Chittagong",
      text: "Been using their Netflix premium for 6 months now. Never had a single issue with the account.",
      rating: 5,
    },
    {
      id: "3",
      name: "Jamil H.",
      location: "Sylhet",
      text: "Adobe CC pricing is incredible. Saved so much money compared to buying directly. Fast support too.",
      rating: 5,
    },
  ];

  const reviews = testimonials && testimonials.length > 0 ? testimonials : defaultReviews;

  return (
    <section className="max-w-6xl mx-auto px-4 py-20 border-t border-white/5">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-1/3 space-y-6 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white">Loved by Thousands of Customers</h2>
          <p className="text-white/40">
            Don't just take our word for it. Join our community of satisfied users.
          </p>
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" />
              ))}
            </div>
            <p className="font-bold text-white text-lg">4.9 / 5</p>
            <p className="text-sm text-white/40">based on 2,400+ verified orders</p>
          </div>
        </div>

        <div className="w-full md:w-2/3 overflow-hidden">
          <Marquee pauseOnHover={true} className="py-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col gap-4 w-[300px] shrink-0 h-[220px]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-500' : 'text-white/20'}`} fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1 line-clamp-4">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{r.name}</p>
                    <p className="text-xs text-white/30 truncate">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
