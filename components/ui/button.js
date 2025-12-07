import { cn } from "@/lib/utils";
export function Button({className,variant="default",...props}){
  const base="px-4 py-2 rounded-lg font-medium transition active:scale-95 inline-flex items-center justify-center";
  const styles={default:"bg-blue-600 text-white hover:bg-blue-700",outline:"border border-gray-400 hover:bg-gray-200",ghost:"hover:bg-gray-200"};
  return <button className={cn(base,styles[variant],className)} {...props}/>
}