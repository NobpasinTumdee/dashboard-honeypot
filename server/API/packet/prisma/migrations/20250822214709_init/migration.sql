-- CreateTable
CREATE TABLE "HttpsPackets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" TEXT NOT NULL,
    "src_ip" TEXT NOT NULL,
    "src_port" TEXT NOT NULL,
    "dst_ip" TEXT NOT NULL,
    "dst_port" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "request_uri" TEXT NOT NULL,
    "user-agent" TEXT NOT NULL
);
