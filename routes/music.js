var express = require('express');
var router = express.Router();
var lex = require('../lexer.js');
/* GET users listing. */
var music = {
    "FF7": {
        "Anxious Heart": ["34b94374-688b-1fd8-69b2-02c83db5b9b0", "7af1b52a-3470-968d-ebbb-8046906bf617", "cfa885ac-cf04-6e80-7d8a-2634bad29889", "1f10880f-1dc2-2d1d-8d43-f0f18558b477", "8c76c494-da77-40fd-f48e-a070de6944bb", "eac05c52-3739-03e0-d97e-10970fcde1e2", "0f6ab7b7-7ae2-b44e-f022-acb9b040c709", "1881a6eb-042d-ed07-1f76-f1f69e7940ea", "002e3444-b214-1f62-5901-342f21c5da55", "7598db04-9ca8-2e58-9604-7a2708bc870a", "4cb151b8-ab1a-c240-ee67-e23cafe412a1", "91cdfc5e-7830-ee93-90c6-7b334e1e1014", "5347f0d6-5fa9-d8fd-40df-4adeeea66977"],
        "Chasing the Black Caped Man": ["a9695094-81c8-2938-deae-fd838884731b", "fe8c194c-61ce-8a99-0b14-1e659bf10395", "e58c2aa5-2de8-1e31-3a2c-30c0af92d362", "d89552e9-eb13-be67-6ee7-22b0821293d8", "d8758011-2c48-a166-013b-6c8c27b9a80d", "b5e02a45-9cee-04c1-4615-69afab2dd814", "24ba7e40-986f-15d5-3bd4-b526b1faef84", "e7539296-c763-f270-f923-1a793568d8c8", "799d3fd0-78cf-0211-d43f-9e7b41352f59", "326adeab-4192-723d-0930-71301b11183d", "38af9ce7-d125-bc0e-e43a-4fca439ca7b1", "9e11b89f-d665-1ffd-09eb-8cb47b161b3a", "5604cbcb-9566-ac00-15f0-9fc2b1ce036c", "87c5e627-f101-2f9d-7b8f-e6e3917a5f64", "a188002b-9799-3939-a3ff-cd6ee7a73647"],
        "Fanfare": ["a9ab4365-74db-0b5b-1d75-ff465c87c13d", "ae83c663-ce39-879e-cf69-460401b9155d", "2b7801ad-80dc-0297-4862-f3f91da59e6f", "804cc46b-3dab-46e8-f97b-c0e10e57eb17", "d768d4d2-556b-c200-10b9-da255573cf46", "bad71d29-c369-638e-e48b-dcc8dea77f43", "e1c3184d-456c-2d8e-cfa2-998910eaf478", "9cd1dba9-8c67-6e48-6f81-4253ad7e0c04"],
        "Fighting": ["9656da71-0d72-3f18-dd9b-83af10889c7c", "6d33ec00-6cf5-b8cf-6bd7-d25250c1d9bc", "71fe08f1-7d1a-8ae9-1228-235b225a7a9a", "3d5e9957-bab5-9979-5781-41dacafe3dc6", "1e4fdefa-a140-5177-38a0-d9bde4251f6b", "254648b1-c598-513c-7b04-b114e2c4ad9c", "29b50cde-23ff-8927-e741-49ecbc3bb9cf", "66ced6c3-f51d-a58b-24b8-cefb175b731d", "88fe93a1-1bdc-f8b3-65e4-8c7a54564fc4", "7597f8c3-cbdd-fa6e-3928-41c034ce6b3c", "b737b2c9-dcf2-2819-3ce9-cdb9f3e7f1ca", "f69b537a-b787-c830-0800-f3ac2ac04d23", "17db57f7-01e3-b56b-221f-b417606cf10f", "8836e855-d084-2564-5759-9a4f4fa7e5fd", "e66746a6-3388-6ec2-493f-c93c03934198", "8df63639-c2fc-946c-2a2d-ae8a244cd4ba"],
        "Hurry!": ["3af10cb7-0e67-92e4-a104-26bf439b32d9", "e892bd82-3718-6649-f8cb-3132a17a1543", "70bf8bef-3099-4c83-8a4a-870f5908d34c", "e7bf6674-702f-8f1e-91c1-56f2efd6749b", "c110bb41-1238-550f-a614-355486b70137", "a7b8e985-5e9d-9de4-6376-c671a94efa66", "fe105949-470e-436e-ad0b-60a79f400429"],
        "Main Theme": ["d612c559-360f-06f9-a86f-2c50770914a2", "4f34c4d6-33c6-7803-06e2-3782db5d6603", "8ef0ebb8-bca9-8b26-d67d-167f768eab37", "4b913196-f47e-8ad6-816a-7fcb36bfafc4", "868cd606-a2d7-9468-3a8a-1d1d3c1e9945", "902f97bf-8394-88ef-c101-5e359bf29bea", "00fe4242-bf3d-c9e4-9c12-a2eeb13acc97", "329f7fd8-f30e-5475-0c4f-3888518fcea3", "ae3a73af-4fd8-02e9-83fe-bb50b737f702", "075397e0-39f6-7e5f-d570-f63ac3f232a8", "3f0db2c4-f050-60e2-36ca-71aae5d71fba", "ed9177a0-aa15-8f95-fb02-177c76626e10", "9841a900-ca26-8e91-b5b5-c70c75f608a6", "463cb4ec-326c-0fdc-4ce0-c126e159378a", "4258401a-deed-5c41-6226-5ceb78a16039", "0ab5f8d9-8623-c1fd-637b-a7f998eda791", "b53bcb68-cf09-fcb3-d21e-3a8b7b29ae95", "4b503e1b-d657-bae9-b1ec-1c040d1faba4", "a9588f88-b505-e581-edb5-67b7b40e7100", "5e6bf2b2-c762-9461-f4df-2ebca84596da", "789c28a9-d155-ac6a-2bb5-6c5302da4985", "40c64499-e911-6753-f7d4-6ead6da26b22", "e13ce02c-ee04-6d63-0387-f2684dbf5095", "05163234-47ed-6f55-6545-90ec41240108", "07d93260-6289-a209-18db-ae98247d95af", "f16e15bb-cb1d-4687-c223-90434e534774", "96b48a26-ab81-8d7f-0089-cad9c27cd7cc", "1252f76c-15d1-8e70-9068-796bfccb93fc", "9dc4f428-b18a-561e-feb5-98c436dd1efb", "3f5c9191-93be-14ee-5632-2863499e2c37", "719a3f65-d410-18cc-24ea-78793c44c94c", "8638ec9b-671a-29dc-eee0-d10a430652f6", "2d472c9f-0a03-e1cd-dace-12f54055413c", "a3a04818-beeb-f381-0c21-163b66881803", "2d3b20c4-5796-5ec0-33c1-388ff037186f", "e32af558-d2f2-49b5-3136-b2e564e4f163", "c79b2af6-8ee5-cdcd-fae7-de8021b1cf2e"],
        "One Winged Angel": ["875d2029-72a9-9a7d-1021-d912cafa442a", "7a6c50a1-7d1d-cc4e-73c5-134a9b6fb3d9", "ddf2bfca-ace1-cac6-7437-21115d50cec2", "dc16d211-9cda-21eb-5c8e-78205d426e6d", "621e2b43-2ad0-f6ff-cf8e-99c29ceeb520", "45060c65-7853-9fb2-4d5e-c7034b0f8b6a", "b9f9d16e-9c70-9bbc-7be2-b350da9b03de", "cd7b79fa-8738-9e27-c058-8718cde73742", "b539ee5f-e2e1-b591-27fe-7904d292cad0", "13be402d-d27d-1015-c4f9-01189dd7eb69", "b44002c5-5128-5e92-950d-a9eeda90aaaf", "258fad44-7f44-405d-e307-b7666224ea1d", "f6fb725a-f3f4-9a2e-0668-0c3959a2e7fc", "7c1b8df5-494c-cb6b-dd43-feff3f365c67", "208edc75-53a7-e128-359b-adb939ab0afd", "ed7fab57-6270-884e-093c-30ebd4866ad9", "d5befa1c-17a3-8035-4e0a-65077f77fa64", "00820bfe-ce2a-98d8-650c-22137f9ee5f0", "359839e3-c6bc-6628-6339-705dffda28aa", "591acb27-017a-f6ea-8756-ce286d157081", "57aa13a9-346c-0541-f714-9c222e9715d2", "408cbf3a-5e21-9391-85d6-826f0527aa31", "ec4c4657-cb42-9457-949f-2dc8050b96c6", "954b2ca6-105a-071e-72eb-088bb09b601e", "4ec0e3ac-b220-0208-002a-0bb987a23ebf"],
        "Prelude": ["8a4bfe66-977b-1307-137d-97db848bd286", "6836a8dc-f74f-5df4-5909-947dcbf4e032", "77603416-c076-a28b-5607-9bbec911acf5", "fa9e06e8-954c-74fe-b38d-9c7e4b885261", "914a0556-12ec-eed2-a9b7-c5f2890972ff", "4b0b3729-bb9b-98ee-20de-e60e96633b26", "e3e88383-18c3-d9b7-8633-327199ca62bb", "5cf5821a-dd9e-e572-f18c-8057d6bc1899", "59e755f2-1df3-0354-4dd8-6ce7107c2cec", "0e661542-3117-d43a-616a-ce763bbf3e43", "9e8ae9df-824f-4918-a11e-831c57f5159b", "0004d678-c492-f80e-f7e4-2ab0066fef3b", "70db69b5-7ff2-1b86-dae8-402a18f9f4bd", "eaf87af7-846c-03c8-f95c-d904f0a5e3bd", "406b6b9e-b139-94e7-adf4-9df865d8281e", "b0b845ef-4183-0fc7-ce91-f4f29a7c6383"],
        "Secrets in the Deep Sea": ["e7b2ecd2-2bed-b5bd-4621-479239b806f5", "92355da4-632d-3b92-61ed-4a19528140d4", "fe6eb6d1-a4fb-6a99-f412-cdc6e6bcd971", "26cb711b-2e61-b041-9bbe-66ca6d8eff19", "15c2fd9c-3ffc-e0aa-f9a3-bf7b596160ac", "9a8c9fef-f42e-0a1f-c582-e0444503660f", "6d5c134a-b6db-05ba-586f-94e05f36ee15", "a26bfd00-d241-708b-ad79-3944a26e6ba9", "4e140720-acc2-564c-408c-dc1e3c4ee979", "9252738c-c38e-1919-0f8f-f39199af9fc6", "6823610b-d6e4-636d-5e2a-1a767988436f", "cb60f99f-12f9-b6e8-ca8a-387c784b8038", "05698f72-cccf-2393-ebb3-6f0f88502cfb", "b7a9a85b-4a7f-2038-6e4b-820624ccf40f"],
        "Shinra": ["14319293-6659-cabf-dc9d-2c28c9eed828", "d29ad3b1-2ce5-fe2f-a28f-de29da434bc4", "b442ea64-9927-6749-66b9-360be96ed8b4", "c17b450f-abc4-78dd-2a8e-cbf1dd9dd3ee", "3c77b754-99fa-37e7-d274-70d0ca9867cb", "4a1c648b-68b0-a6d6-8cf9-4c7b5d2e6cce", "412ae19b-e502-40c0-2988-79ebe3067206", "11ebe6ce-e3dc-933c-729e-bb1782ebb674", "745af378-d331-b61b-0f57-c8b808c2bb6b", "ff3494b2-f2d0-5ad2-2f94-b52408959721", "3b9d598f-6cf3-c5bc-f70c-a07eb3fbdb90", "e42f475e-7333-c057-d91b-5c5deaed88c2", "11235e67-8fa1-c5a9-a9a0-61f9e32d7230"],
    }
}
router.get('/', function(req, res, next) {
    var album = req.query.album;
    var name = req.query.song;
    if (name == null && album in music) {
        var out = [];
        for (var key in music[album]) {
            out.push(key);
        }
        res.send(JSON.stringify(out));
        return;
    }
    if (album in music && name in music[album]) {
        var obj = {};
        obj["song"] = name;
        obj["uuids"] = music[album][name];
        res.send(JSON.stringify(obj));
    }
    else {
        if (!album in music) res.send("Could not find album with name: '" + album + "'");
        else {
            for (var key in music[album]) {
                var song = key.toLowerCase();
                var search = name.toLowerCase();
                if (song.indexOf(search) != -1) {
                    var obj = {};
                    obj["song"] = name;
                    obj["uuids"] = music[album][name];
                    res.send(JSON.stringify(obj));
                    return;
                }
            }
            res.send("Could not find song with name: '" + name + "'");
        }
    }
});

module.exports = router;