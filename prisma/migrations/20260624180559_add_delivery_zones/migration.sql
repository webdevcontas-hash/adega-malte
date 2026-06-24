-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "neighborhood" TEXT NOT NULL,
    "fee" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryZone_neighborhood_key" ON "DeliveryZone"("neighborhood");
