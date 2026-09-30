import type { StaticImageData } from "next/image";
import abroad from "@/public/photos/abroad.jpg";
import allowance from "@/public/photos/allowance.jpg";
import birth from "@/public/photos/birth.jpg";
import education from "@/public/photos/education.jpg";
import house from "@/public/photos/house.jpg";
import vote from "@/public/photos/vote.jpg";
import business from "@/public/photos/business.jpg";
import health from "@/public/photos/health.jpg";
import land from "@/public/photos/land.jpg";
import licence from "@/public/photos/licence.jpg";
import marriage from "@/public/photos/marriage.jpg";
import passport from "@/public/photos/passport.jpg";
import ward from "@/public/photos/ward.jpg";

export type Situation = {
  id: string;
  photo: StaticImageData;
  alt: string;
  office: string;
  /** The same question, asked three ways. */
  prompts: { en: string; roman: string; ne: string };
};

export const situations: Situation[] = [
  s("passport", passport, "The gate of the Department of Passports in Kathmandu", "Department of Passports",
    "What do I need to renew my passport?", "passport renew garna k k chahincha?", "पासपोर्ट नवीकरण गर्न के के चाहिन्छ?"),
  s("abroad", abroad, "Travellers with suitcases walking to Tribhuvan International Airport", "Department of Foreign Employment",
    "How do I get a labour permit to work abroad?", "baideshik rojgar ko shram swikriti kasari line?", "वैदेशिक रोजगारको श्रम स्वीकृति कसरी लिने?"),
  s("house", house, "Workers building a new brick house outside Kathmandu", "Municipality",
    "What do I need to get my house plans approved?", "ghar ko naksa pass garna k chahincha?", "घरको नक्सा पास गर्न के चाहिन्छ?"),
  s("marriage", marriage, "A bride's hennaed hands at a Nepali wedding", "Ward office",
    "We just got married. How do we register it?", "bihe darta kasari garne?", "विवाह दर्ता कसरी गर्ने?"),
  s("education", education, "Schoolchildren in uniform walking along a village road", "Ministry of Education",
    "When do SEE results come out?", "SEE ko result kahile aauchha?", "एसईईको नतिजा कहिले आउँछ?"),
  s("business", business, "A shopkeeper at a stall of colour powders", "Inland Revenue Department",
    "How do I register my shop and get a PAN?", "pasal darta ra PAN kasari banaune?", "पसल दर्ता र प्यान कसरी बनाउने?"),
  s("health", health, "People gathered outside a rural health clinic", "Health Insurance Board",
    "How do I join the national health insurance?", "swasthya bima kasari garne?", "स्वास्थ्य बीमा कसरी गर्ने?"),
  s("land", land, "Farmers planting rice in terraced fields near Kathmandu", "Land Revenue Office",
    "How do I transfer land into my name?", "jagga namsari kasari garne?", "जग्गा नामसारी कसरी गर्ने?"),
  s("birth", birth, "A mother carrying her baby on her back", "Ward office",
    "How do I register my baby's birth?", "janma darta kasari garne?", "जन्म दर्ता कसरी गर्ने?"),
  s("licence", licence, "Traffic trails along a Kathmandu road at night", "Department of Transport Management",
    "How do I apply for a driving licence?", "license ko lagi kasari apply garne?", "ड्राइभिङ लाइसेन्सका लागि कसरी आवेदन दिने?"),
  s("allowance", allowance, "An elderly woman smiling in a doorway in Kathmandu", "Ward office",
    "When can my mother get the senior citizen allowance?", "briddha bhatta kahile dekhi paincha?", "वृद्ध भत्ता कहिलेदेखि पाइन्छ?"),
  s("vote", vote, "An elderly man reading the morning newspaper in Basantapur", "Election Commission",
    "How do I register to vote?", "matdata namawali ma naam kasari lekhaune?", "मतदाता नामावलीमा नाम कसरी लेखाउने?"),
  s("ward", ward, "A rural municipality ward office building", "Ward office",
    "What do I need for a ward recommendation letter?", "ward ko sifaris lina k chahincha?", "वडाको सिफारिस लिन के चाहिन्छ?"),
];

function s(id: string, photo: StaticImageData, alt: string, office: string, en: string, roman: string, ne: string): Situation {
  return { id, photo, alt, office, prompts: { en, roman, ne } };
}

/** Real public bodies whose information the service draws on. */
export const offices = [
  "Department of Passports",
  "Inland Revenue Department",
  "Department of Transport Management",
  "Office of the Company Registrar",
  "Department of Foreign Employment",
  "Department of Immigration",
  "Health Insurance Board",
  "Social Security Fund",
  "Public Service Commission",
  "Election Commission",
  "Survey Department",
  "Department of Customs",
  "Ministry of Education",
  "Ministry of Health and Population",
  "Ministry of Home Affairs",
  "Ministry of Federal Affairs",
  "Department of National ID",
  "District Administration Office",
  "Land Revenue Office",
  "Nepal Rastra Bank",
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
  "Metropolitan city",
  "Sub-metropolitan city",
  "Municipality",
  "Rural municipality",
  "Ward office",
];
