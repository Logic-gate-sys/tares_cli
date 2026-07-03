import { NavigationBar } from "#components/home/navigation-bar";
import { Outlet } from "react-router-dom";

export default function HomeLayout() {
    return (
        <>
          <NavigationBar/>
          <Outlet/>
        </>
    )
}