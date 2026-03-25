
import Link from "next/link"
import NavBar from "../components/NavBar";
export default async function page(){

    return(<>
    <NavBar/>
    <div className = "flex flex-row gap-10" >
        <Link href= "teacher/questions"><div className = " p-4 border rounded-lg bg-blue-300 select-none border-blue-700  hover:cursor-pointer m-3">Create Questions</div></Link>
        <Link href= "/viewquestions"><div className = " p-4 border rounded-lg bg-blue-300  select-none border-blue-700  hover:cursor-pointer m-3">View questions</div></Link>
        

    </div>
    </>)
}