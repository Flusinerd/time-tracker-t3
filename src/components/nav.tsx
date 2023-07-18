import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const { status } = useSession();

  return (
    <>
      <style jsx>{`
        // Create a gradient border from
        nav {
          border-right: 1px solid transparent;
          border-image: linear-gradient(to bottom, #00dc82, #36e4da) 1;
        }
      `}</style>
      <nav className="box-border flex min-h-screen w-16 flex-col items-center pr-[1px]">
        <ul className="mt-4 flex grow flex-col justify-center">
          <li className="flex h-16 items-center justify-center">
            <Link href={""}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                className="h-8 w-8 fill-primary transition-all hover:scale-110 hover:fill-primary-light"
              >
                <path d="M360-860v-60h240v60H360Zm90 447h60v-230h-60v230Zm30 332q-74 0-139.5-28.5T226-187q-49-49-77.5-114.5T120-441q0-74 28.5-139.5T226-695q49-49 114.5-77.5T480-801q67 0 126 22.5T711-716l51-51 42 42-51 51q36 40 61.5 97T840-441q0 74-28.5 139.5T734-187q-49 49-114.5 77.5T480-81Zm0-60q125 0 212.5-87.5T780-441q0-125-87.5-212.5T480-741q-125 0-212.5 87.5T180-441q0 125 87.5 212.5T480-141Zm0-299Z" />
              </svg>
            </Link>
          </li>
          <li className="flex h-16 items-center justify-center">
            <Link href={""}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                className="h-8 w-8 fill-primary transition-all hover:scale-110 hover:fill-primary-light"
              >
                <path d="m434-255 229-229-39-39-190 190-103-103-39 39 142 142ZM220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" />
              </svg>
            </Link>
          </li>
          <li className="flex h-16 items-center justify-center">
            <Link href={"/projects"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 fill-primary transition-all hover:scale-110 hover:fill-primary-light"
                viewBox="0 -960 960 960"
              >
                <path d="M319-250h322v-60H319v60Zm0-170h322v-60H319v60ZM220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554v-186H220v680h520v-494H551ZM220-820v186-186 680-680Z" />
              </svg>
            </Link>
          </li>
          {status === "authenticated" && (
            <li className="mb-8 mt-auto">
              <Link href={"/auth/signout"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  className="h-8 w-8 fill-primary transition-all hover:scale-110 hover:fill-primary-light"
                >
                  <path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h299v60H180v600h299v60H180Zm486-185-43-43 102-102H360v-60h363L621-612l43-43 176 176-174 174Z" />
                </svg>
              </Link>
            </li>
          )}
          {status === "unauthenticated" && (
            <li className="mb-8 mt-auto">
              <Link href={"/auth/signin"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 fill-primary transition-all hover:scale-110 hover:fill-primary-light"
                  viewBox="0 -960 960 960"
                >
                  <path d="M481-120v-60h299v-600H481v-60h299q24 0 42 18t18 42v600q0 24-18 42t-42 18H481Zm-55-185-43-43 102-102H120v-60h363L381-612l43-43 176 176-174 174Z" />
                </svg>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
