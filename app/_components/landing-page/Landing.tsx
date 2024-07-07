"use client";

import {
  fontSizeVariants,
  fontVariants,
  themeVariants,
} from "@/app/(viewer_shell)/_data/settingsData";
import folderTreeGraphGif from "@/app/_asset/folderTreeGraph.gif";
import folderTreeGraphImg from "@/app/_asset/folderTreeGraph.jpg";
import landingFolderGif from "@/app/_asset/landingFolder.gif";
import landingFolderImg from "@/app/_asset/landingFolder.jpg";
import linkedPostsGraphGif from "@/app/_asset/linkedPostsGraph.gif";
import linkedPostsGraphImg from "@/app/_asset/linkedPostsGraph.jpg";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowLeftIcon, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useIntersectionObserver, useMediaQuery } from "usehooks-ts";
import Logo from "../Logo";
import GifCard from "./GifCard";
import TypeWriter from "./TypeWriter";

const themes = [
  [fontVariants["default"], fontSizeVariants[16], themeVariants["light"]],
  [fontVariants["fantasy"], fontSizeVariants[14], themeVariants["sepia"]],
  [fontVariants["mono"], fontSizeVariants[36], themeVariants["retro"]],
  [fontVariants["cursive"], fontSizeVariants[24], themeVariants["dark"]],
  [fontVariants["serif"], fontSizeVariants[20], themeVariants["night"]],
].map((theme) => theme.join(" "));

export default function Landing() {
  const [fadeIn, setFadeIn] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [viewerThemeIndex, setViewerThemeIndex] = useState(0);
  const viewerTheme = themes[viewerThemeIndex];
  const [viewerMaxWidth, setViewerMaxWidth] = useState("w-[320px]");
  const [viewerTitleOpacity, setViewerTitleOpacity] = useState("opacity-100");

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isSafari =
    userAgent.includes("safari") && !userAgent.includes("chrome");
  const safariFantasyStyle =
    isSafari && viewerThemeIndex === 1 ? "leading-[3] h-8" : "";

  const { ref: ref0 } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerThemeIndex(0);
      }
    },
    threshold: 0.5,
  });
  const { ref: ref1 } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerThemeIndex(1);
      }
    },
    threshold: 0.5,
  });

  const { ref: ref2 } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerThemeIndex(2);
      }
    },
    threshold: 0.5,
  });

  const { ref: ref3 } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerThemeIndex(3);
      }
    },
    threshold: 0.5,
  });

  const { ref: ref4 } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerThemeIndex(4);
      }
    },
    threshold: 0.75,
  });

  const { ref: widthRef } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        setViewerMaxWidth("w-[min(800px,calc(100dvw-1rem))]");
        setViewerTitleOpacity("opacity-0");
      } else {
        setViewerMaxWidth("w-[320px]");
        setViewerTitleOpacity("opacity-100");
      }
      isIntersecting
        ? setViewerMaxWidth("w-[min(800px,calc(100dvw-1rem))]")
        : setViewerMaxWidth("w-[320px]");
    },
  });

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div
      className={`${fadeIn ? "opacity-100" : "opacity-0"} relative transition-opacity duration-500 ease-in-out`}
    >
      <Carousel
        className="w-full max-w-[100dvw] lg:max-w-5xl"
        opts={{ active: !isDesktop }}
      >
        <CarouselContent>
          <CarouselItem className="ml-2 basis-auto lg:ml-0 lg:basis-1/3">
            <GifCard
              title="Folder Structure"
              gif={landingFolderGif}
              img={landingFolderImg}
            />
          </CarouselItem>
          <CarouselItem className="basis-auto lg:basis-1/3">
            <GifCard
              title="Tree Graph"
              gif={folderTreeGraphGif}
              img={folderTreeGraphImg}
            />
          </CarouselItem>
          <CarouselItem className="mr-2 basis-auto lg:mr-0 lg:basis-1/3">
            <GifCard
              title="Graph of linked posts"
              gif={linkedPostsGraphGif}
              img={linkedPostsGraphImg}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <button
        className="mx-auto mt-16 flex h-fit w-fit animate-bounce items-center justify-center rounded-full border border-muted bg-muted/25 p-2"
        onClick={() =>
          document
            .getElementById("mask")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </button>

      <div>
        <div
          id="mask"
          className="sticky top-0 z-30 flex h-lvh w-full flex-col items-center justify-center bg-transparent"
        >
          <div className="w-full flex-1 bg-background" />
          <div
            className={cn(
              viewerMaxWidth,
              "relative h-[600px] rounded-lg bg-transparent outline outline-8 outline-background transition-[width] duration-500 ease-in-out",
            )}
          >
            <div
              className={cn(
                viewerTheme,
                "absolute top-0 z-50 w-full rounded-t-lg",
              )}
            >
              <div className="flex items-center justify-between p-1">
                <div className="z-50 text-base">
                  <ArrowLeftIcon className="m-2 h-4 w-4 opacity-75 group-hover:opacity-100" />
                </div>
                <p
                  className={cn(
                    "line-clamp-1 text-sm transition-opacity duration-1000",
                    viewerTitleOpacity,
                    safariFantasyStyle,
                  )}
                >
                  CHAPTER I. WHICH TREATS OF THE CHARACTER AND PURSUITS OF THE
                  FAMOUS GENTLEMAN DON QUIXOTE OF LA MANCHA
                </p>
                <div className="z-50 text-base">
                  <Settings2 className="m-2 h-4 w-4 opacity-75 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex-1 bg-background" />
        </div>
        <div
          className={cn(
            viewerTheme,
            viewerMaxWidth,
            "z-30 mx-auto -translate-y-[100lvh] overflow-hidden pt-[calc(50lvh-300px+3rem)] transition-[width] duration-500 ease-in-out",
          )}
        >
          <div className="relative h-fit pt-48">
            {[ref0, ref1, ref2, ref3, ref4].map((ref, i, array) => (
              <div
                ref={ref}
                key={"ref-" + i}
                className={
                  i + 1 === array.length ? "h-[max(800px,100lvh)]" : "h-[800px]"
                }
              />
            ))}
            <div className="absolute inset-0 mx-auto w-[320px] px-4">
              {viewerContent}
            </div>
            <div
              className={cn(
                "absolute bottom-0 z-40 h-96 w-full bg-gradient-to-b from-transparent",
                viewerThemeIndex === 0 ? "to-white" : "to-gray-800",
              )}
            />
          </div>
        </div>
      </div>
      <div
        ref={widthRef}
        className={cn(
          viewerTheme,
          viewerMaxWidth,
          "sticky z-10 mx-auto h-dvh -translate-y-[100lvh] pt-[calc(50lvh-300px+3rem)] transition-[width] duration-500 ease-in-out",
        )}
      >
        <div className="light mx-6 flex flex-col rounded-xl bg-background p-4 font-sans text-foreground">
          <div className="mb-2 flex flex-wrap-reverse items-center justify-end gap-2">
            <Button className="disabled:opacity-100" disabled>
              Save & Publish
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input
              readOnly
              value={
                "CHAPTER II. WHICH TREATS OF THE FIRST SALLY THE INGENIOUS DON QUIXOTE MADE FROM HOME"
              }
            />
            <p className="text-sm text-muted-foreground">
              Posts in the same folder must have different titles.
            </p>
          </div>
        </div>

        <div className="z-40 mx-auto mt-8 flex w-[calc(100%-3rem)] items-center justify-center text-center text-sm opacity-90">
          <div className="mx-auto w-fit max-w-full rounded-md p-1.5 transition-colors hover:cursor-pointer hover:bg-transparent/5 hover:text-inherit">
            <p
              className={`line-clamp-1 whitespace-pre-wrap break-words text-center`}
            >
              {
                "CHAPTER II. WHICH TREATS OF THE FIRST SALLY THE INGENIOUS DON QUIXOTE MADE FROM HOME"
              }
            </p>
          </div>
        </div>

        <div className="mt-4 px-6">
          <TypeWriter
            prefix="Write"
            words={[" Here", " where your readers actually read."]}
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-50 flex h-lvh w-full flex-col items-center justify-center gap-4">
        <p className="flex flex-col items-center justify-center gap-1 text-2xl text-foreground/75 sm:flex-row">
          <span>Write with structure,</span>
          <span className="mx-0.5 text-foreground">
            expand your universe<span className="text-primary">.</span>
          </span>
        </p>
        <Logo />
        <Button
          className="bg-primary/75 hover:bg-primary/50"
          variant="secondary"
          asChild
        >
          <Link href="/home">Get started</Link>
        </Button>
      </div>
    </div>
  );
}

const viewerContent = (
  <>
    <p>
      &nbsp; In a village of La Mancha, the name of which I have no desire to
      call to mind, there lived not long since one of those gentlemen that keep
      a lance in the lance-rack, an old buckler, a lean hack, and a greyhound
      for coursing. An olla of rather more beef than mutton, a salad on most
      nights, scraps on Saturdays, lentils on Fridays, and a pigeon or so extra
      on Sundays, made away with three-quarters of his income. The rest of it
      went in a doublet of fine cloth and velvet breeches and shoes to match for
      holidays, while on week-days he made a brave figure in his best homespun.
      He had in his house a housekeeper past forty, a niece under twenty, and a
      lad for the field and market-place, who used to saddle the hack as well as
      handle the bill-hook. The age of this gentleman of ours was bordering on
      fifty; he was of a hardy habit, spare, gaunt-featured, a very early riser
      and a great sportsman. They will have it his surname was Quixada or
      Quesada (for here there is some difference of opinion among the authors
      who write on the subject), although from reasonable conjectures it seems
      plain that he was called Quexana. This, however, is of but little
      importance to our tale; it will be enough not to stray a hair’s breadth
      from the truth in the telling of it.
    </p>
    <br />
    <p>
      &nbsp; You must know, then, that the above-named gentleman whenever he was
      at leisure (which was mostly all the year round) gave himself up to
      reading books of chivalry with such ardour and avidity that he almost
      entirely neglected the pursuit of his field-sports, and even the
      management of his property; and to such a pitch did his eagerness and
      infatuation go that he sold many an acre of tillageland to buy books of
      chivalry to read, and brought home as many of them as he could get. But of
      all there were none he liked so well as those of the famous Feliciano de
      Silva’s composition, for their lucidity of style and complicated conceits
      were as pearls in his sight, particularly when in his reading he came upon
      courtships and cartels, where he often found passages like “the reason of
      the unreason with which my reason is afflicted so weakens my reason that
      with reason I murmur at your beauty;” or again, “the high heavens, that of
      your divinity divinely fortify you with the stars, render you deserving of
      the desert your greatness deserves.” Over conceits of this sort the poor
      gentleman lost his wits, and used to lie awake striving to understand them
      and worm the meaning out of them; what Aristotle himself could not have
      made out or extracted had he come to life again for that special purpose.
      He was not at all easy about the wounds which Don Belianis gave and took,
      because it seemed to him that, great as were the surgeons who had cured
      him, he must have had his face and body covered all over with seams and
      scars. He commended, however, the author’s way of ending his book with the
      promise of that interminable adventure, and many a time was he tempted to
      take up his pen and finish it properly as is there proposed, which no
      doubt he would have done, and made a successful piece of work of it too,
      had not greater and more absorbing thoughts prevented him.
    </p>
    <br />
    <p>
      &nbsp; Many an argument did he have with the curate of his village (a
      learned man, and a graduate of Siguenza) as to which had been the better
      knight, Palmerin of England or Amadis of Gaul. Master Nicholas, the
      village barber, however, used to say that neither of them came up to the
      Knight of Phœbus, and that if there was any that could compare with him it
      was Don Galaor, the brother of Amadis of Gaul, because he had a spirit
      that was equal to every occasion, and was no finikin knight, nor
      lachrymose like his brother, while in the matter of valour he was not a
      whit behind him. In short, he became so absorbed in his books that he
      spent his nights from sunset to sunrise, and his days from dawn to dark,
      poring over them; and what with little sleep and much reading his brains
      got so dry that he lost his wits. His fancy grew full of what he used to
      read about in his books, enchantments, quarrels, battles, challenges,
      wounds, wooings, loves, agonies, and all sorts of impossible nonsense; and
      it so possessed his mind that the whole fabric of invention and fancy he
      read of was true, that to him no history in the world had more reality in
      it. He used to say the Cid Ruy Diaz was a very good knight, but that he
      was not to be compared with the Knight of the Burning Sword who with one
      back-stroke cut in half two fierce and monstrous giants. He thought more
      of Bernardo del Carpio because at Roncesvalles he slew Roland in spite of
      enchantments, availing himself of the artifice of Hercules when he
      strangled Antæus the son of Terra in his arms. He approved highly of the
      giant Morgante, because, although of the giant breed which is always
      arrogant and ill-conditioned, he alone was affable and well-bred. But
      above all he admired Reinaldos of Montalban, especially when he saw him
      sallying forth from his castle and robbing everyone he met, and when
      beyond the seas he stole that image of Mahomet which, as his history says,
      was entirely of gold. To have a bout of kicking at that traitor of a
      Ganelon he would have given his housekeeper, and his niece into the
      bargain.
    </p>
    <br />
    <p>
      &nbsp; In short, his wits being quite gone, he hit upon the strangest
      notion that ever madman in this world hit upon, and that was that he
      fancied it was right and requisite, as well for the support of his own
      honour as for the service of his country, that he should make a
      knight-errant of himself, roaming the world over in full armour and on
      horseback in quest of adventures, and putting in practice himself all that
      he had read of as being the usual practices of knights-errant; righting
      every kind of wrong, and exposing himself to peril and danger from which,
      in the issue, he was to reap eternal renown and fame. Already the poor man
      saw himself crowned by the might of his arm Emperor of Trebizond at least;
      and so, led away by the intense enjoyment he found in these pleasant
      fancies, he set himself forthwith to put his scheme into execution.
    </p>
    <br />
    <p>
      &nbsp; The first thing he did was to clean up some armour that had
      belonged to his great-grandfather, and had been for ages lying forgotten
      in a corner eaten with rust and covered with mildew. He scoured and
      polished it as best he could, but he perceived one great defect in it,
      that it had no closed helmet, nothing but a simple morion. This
      deficiency, however, his ingenuity supplied, for he contrived a kind of
      half-helmet of pasteboard which, fitted on to the morion, looked like a
      whole one. It is true that, in order to see if it was strong and fit to
      stand a cut, he drew his sword and gave it a couple of slashes, the first
      of which undid in an instant what had taken him a week to do. The ease
      with which he had knocked it to pieces disconcerted him somewhat, and to
      guard against that danger he set to work again, fixing bars of iron on the
      inside until he was satisfied with its strength; and then, not caring to
      try any more experiments with it, he passed it and adopted it as a helmet
      of the most perfect construction.
    </p>
    <br />
    <p>
      &nbsp; He next proceeded to inspect his hack, which, with more quartos
      than a real and more blemishes than the steed of Gonela, that “tantum
      pellis et ossa fuit,” surpassed in his eyes the Bucephalus of Alexander or
      the Babieca of the Cid. Four days were spent in thinking what name to give
      him, because (as he said to himself) it was not right that a horse
      belonging to a knight so famous, and one with such merits of his own,
      should be without some distinctive name, and he strove to adapt it so as
      to indicate what he had been before belonging to a knight-errant, and what
      he then was; for it was only reasonable that, his master taking a new
      character, he should take a new name, and that it should be a
      distinguished and full-sounding one, befitting the new order and calling
      he was about to follow. And so, after having composed, struck out,
      rejected, added to, unmade, and remade a multitude of names out of his
      memory and fancy, he decided upon calling him Rocinante, a name, to his
      thinking, lofty, sonorous, and significant of his condition as a hack
      before he became what he now was, the first and foremost of all the hacks
      in the world.
    </p>
  </>
);
