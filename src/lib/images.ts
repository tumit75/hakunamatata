// Unsplash stock photos (Unsplash License), chosen to match East African / Ugandan settings.
// All links were checked. Served through next/image.
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  /* Hero slideshow */
  hero: u("photo-1777872721419-f738c532df1f", 2400), // resort pool on an acacia lawn
  heroPool: u("photo-1668276490368-409a6002756d", 2400), // round plunge pool over the savanna
  heroLodge: u("photo-1754078219069-7565df2033b0", 2400), // thatched cottage on a green hillside

  /* Uganda landscapes */
  lakeBunyonyi: u("photo-1551357141-f73a8402ceb3"), // terraced hills, Lake Bunyonyi
  lakeIslands: u("photo-1551357140-c61c4f40224e"), // lake with forested islands
  greenValley: u("photo-1727797716658-469836019c90"), // lush valley seen from a veranda
  hillRoad: u("photo-1551357176-67341c5b414f"),
  countryRoad: u("photo-1761069346828-2ca360f8fa3f"), // red dirt road through green fields
  nileFalls: u("photo-1704183683766-37137be69d4f"), // Murchison Falls
  nileRiver: u("photo-1672590273072-6a92fa9e7f30"),

  /* Wildlife */
  gorilla: u("photo-1614528767034-70de9fe166e0"),
  chimps: u("photo-1782664400470-e9eb0a948aef"),
  giraffes: u("photo-1588539689321-4b4f1391058f"),
  safariDrive: u("photo-1516426122078-c23e76319801"),
  acaciaSunset: u("photo-1547471080-7cc2caa01a7e"),
  giraffeSunset: u("photo-1489392191049-fc10c97e64b6"),
  giraffePool: u("photo-1515914560649-8fe5d631aa62"),
  hornbill: u("photo-1772175602052-e08afa985a78"),
  hornbillPortrait: u("photo-1779101123385-1ede85b4f5c7"),
  hornbillLeaves: u("photo-1558877428-0d15d72f0a8b"),

  /* Lodge & cottages */
  lodgeLounge: u("photo-1779216175784-a67b6da108bb"), // open-air thatched lounge
  lodgeDeck: u("photo-1766603636766-1f4662469448"), // deck with hammock and pool
  lodgeCabinDusk: u("photo-1789349390494-cb63b8265716"), // cottages and deck lit at night
  lodgeSuite: u("photo-1734362815901-24bdeb199da5"), // thatched suite, canopy bed
  safariVehicle: u("photo-1645777762255-42cf89268517"),
  poolThatch: u("photo-1520250497591-112f2f40a3f4"), // pool with thatched huts and palms
  lodgePoolNight: u("photo-1759372945658-1e9f56e751bd"), // thatched villa and pool at twilight
  thatchedCottage: u("photo-1754078219069-7565df2033b0"),
  carvedCottage: u("photo-1712700132572-2fcf34c656e3"),
  treehouseCliff: u("photo-1762067412033-83b4420574a3"),
  treehouseForest: u("photo-1781991173914-1e8369b5c373"),

  /* Rooms */
  roomCanopy: u("photo-1791535767080-42f5c51e49d0"),
  roomCanopyView: u("photo-1791535767615-2fb43a41e8a8"),
  roomCanopyBalcony: u("photo-1791535766539-32200ac0ba30"),
  roomJungle: u("photo-1774280954999-9758f11f3d41"),
  roomTimber: u("photo-1791444057586-ee2fe9a19571"),
  roomRomance: u("photo-1791535767743-973782ed3f40"),
  roomGarden: u("photo-1611892440504-42a792e24d32"),

  /* Gardens */
  gardenTropical: u("photo-1730660338791-8d63548efc75"),
  gardenPath: u("photo-1599685315640-9ceab2f58148"),
  gardenHeliconia: u("photo-1762717564618-e848952f8224"),
  gardenFerns: u("photo-1727636914828-9c7288d0a3b9"),
  gardenLush: u("photo-1470058869958-2a77ade41c02"),
  roseGarden: u("photo-1585320806297-9794b3e4eeae"),

  /* Dining */
  diningFeast: u("photo-1665332195309-9d75071138f0"), // grilled fish, skewers, jollof
  diningClayPots: u("photo-1773209928058-cfd3314acc7c"),
  diningStew: u("photo-1773209927898-a0a7e0a13125"),
  diningGrill: u("photo-1555939594-58d7cb561ad1"),
  diningBowl: u("photo-1534939561126-855b8675edd7"),
  diningSpread: u("photo-1665400808116-f0e6339b7e9a"),
  diningMarket: u("photo-1761567523932-6c461c249729"), // fresh produce, farm-to-table
  diningGuest: u("photo-1689155494424-d2337856fe3e"),

  /* Activities */
  campfire: u("photo-1475483768296-6163e08872a1"),
  campfireLake: u("photo-1478131143081-80f7f84ca84d"),
  canopyWalk: u("photo-1562490654-131366a15276"), // rope canopy walkway in rainforest
  canopyBridge: u("photo-1558603200-ad1648109a1a"),
  atvTrail: u("photo-1515007507252-fc11563a273e"), // quad bikes lined up on green field
  atvRide: u("photo-1701602078164-89eaa64496db"),
  playground: u("photo-1596997000103-e597b3ca50df"),
  playSlide: u("photo-1634608874538-443b84f7b06b"),
  playSwing: u("photo-1593103916129-87e179a70c1f"),
  spaMassage: u("photo-1544161515-4ab6ce6db874"),
  spaStones: u("photo-1540555700478-4be289fbecef"),

  /* Weddings */
  weddingCeremony: u("photo-1772127822562-a898d9f5733c"), // outdoor ceremony arch
  weddingCouple: u("photo-1695281536457-01f9a07c575b"),
  weddingDance: u("photo-1784202388427-5c92c7a165a6"),
  weddingExit: u("photo-1608009232260-9b527a5bb9bd"),
  weddingTraditional: u("photo-1661332517932-2d441bfb2994"),
  weddingTable: u("photo-1511795409834-ef04bbd61622"),
  weddingBanquet: u("photo-1519225421980-715cb0215aed"),

  /* Corporate */
  corporateBoardroom: u("photo-1573164574572-cb89e39749b4"),
  corporateWorkshop: u("photo-1655720357872-ce227e4164ba"),
  corporatePanel: u("photo-1776039325163-f45315a484f3"),
  corporateMeeting: u("photo-1573164574397-dd250bc8a598"),
  /* Extra lodge, dining, people and activity photos (high resolution) */
  archPool: u("photo-1777872721345-dccb2989f646"), // acacia lawn and pool framed by a stone arch
  bathDeck: u("photo-1764977224678-65ab06ea020a"), // freestanding bath on a deck over the savanna
  lodgeBalcony: u("photo-1775283537748-4fc2b5fb28c0"), // timber balcony among banana trees
  lodgeNightDeck: u("photo-1767324672969-48e788321404"),
  glampTent: u("photo-1789930153694-14f21db66d1d"),
  starTent: u("photo-1478827536114-da961b7f86d2"), // lit tent under the stars
  gardenGazebo: u("photo-1785507340331-ea650ca9180e"), // thatched gazebo with bougainvillea
  villaGarden: u("photo-1721989519334-40923a0ee1c0"),
  aerialPool: u("photo-1728048756766-55208c6feb87"),
  elephants: u("photo-1720663520883-aeb55b215bfb"), // elephant and calf among borassus palms
  balloonSafari: u("photo-1519659528534-7fd733a832a0"),
  lakeVictoria: u("photo-1751561484224-71ecfb3086d9"), // fishing boat on Lake Victoria
  teaTerraces: u("photo-1756245994848-1eb2be3b9b63"),
  bushDinner: u("photo-1696334872500-3968a5feb631"), // candlelit bush dinner by the water
  sunsetTable: u("photo-1621844447904-98c2fbd16cef"), // long table under string lights at sunset
  savannaTable: u("photo-1787250230750-5090d8516d97"), // long table under an acacia
  breakfastSpread: u("photo-1782177261793-823b94aa0555"),
  sharingTable: u("photo-1530062845289-9109b2c9c868"),
  buffet: u("photo-1639432047673-91ea142f9cf5"),
  brunchTable: u("photo-1543168256-8133cc8e3ee4"),
  familyPicnic: u("photo-1628517290972-74a92219db50"),
  familyFun: u("photo-1643818657367-491080baeece"),
  familySafari: u("photo-1766402221171-44041c8293b7"),
  couple: u("photo-1689078330321-5d70c56ac2f0"),
  ropesCourse: u("photo-1758225351177-1069bdd4ce1b"),
  canyoning: u("photo-1774982625681-7f9178c2ecfe"),
  teamGames: u("photo-1774599661166-ae302f07dd37"),
  gardenFeast: u("photo-1672984174312-bd153327150c"), // long garden table laid with food (portrait)
  spaHotStone: u("photo-1600334129128-685c5582fd35"), // hot stone massage with white flowers
  rafting: u("photo-1760904652241-36ad6b4e752f"), // white-water rafting through big rapids
} as const;

export type ImageKey = keyof typeof IMG;
