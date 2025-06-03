import { Carousel } from '@mantine/carousel';
import RootEquation from './components/RootEquation';
import ClosedMethod from './components/ClosedMethod';
import {BiseksiNRegula, MetodeIterasi, MetodeNewtonRaphson, MetodeSecant} from "../../../public/images"
import { Link } from 'react-router-dom';

const NavCard = ({image, label, url})=>{
  return <Link to={url} className="border rounded-md flex flex-col justify-center items-center p-2 h-full hover:shadow-lg ease-in-out duration-200 cursor-pointer hover:bg-gray-100">
    <img src={image} alt="" className='object-cover h-[20vh]' />
    <p>{label}</p>
  </Link>
}

export default function StoryPage() {
  return (
    <main className="w-full h-screen flex justify-center items-center">
      <Carousel
        withControls={false}
        orientation="vertical"
        height={600}
        draggable
        withIndicators
        className="absolute left-0 top-0 w-3xl bg-white rounded-xl border border-gray-200"
      >
        <RootEquation />
        <ClosedMethod />
        <Carousel.Slide className='grid grid-cols-2 h-full'>
          <NavCard image={BiseksiNRegula} label={"Bisection & RegulaFalsi"} url={"/metode_tertutup"} />
          <NavCard image={MetodeIterasi} label={"Metode Iterasi Titik Tetap"} url={"/metode_iterasi"} />
          <NavCard image={MetodeNewtonRaphson} label={"Newton Raphson"} url={"/newton_raphson"} />
          <NavCard image={MetodeSecant} label={"Metode Secant"} url={"/metode_secant"} />
        </Carousel.Slide>
      </Carousel>
    </main>
  );
}
