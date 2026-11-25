class TrendItem {
  final String id;
  final int rank;
  final int rankDelta;
  final String title;
  final String summary;
  final String platform;
  final String category;
  final String region;
  final String timeRange;
  final String creatorName;
  final String publishedAt;
  final String? thumbnailUrl;
  final int? views;
  final int? likes;
  final int? comments;
  final int? shares;
  final double? growthRate;
  final int viralIndex;
  final List<String> keywords;
  final List<String> hashtags;
  final String originalUrl;
  final String dataSourceType;
  final String sourceLabel;
  final String lastUpdatedAt;

  const TrendItem({
    required this.id,
    required this.rank,
    required this.rankDelta,
    required this.title,
    required this.summary,
    required this.platform,
    required this.category,
    required this.region,
    required this.timeRange,
    required this.creatorName,
    required this.publishedAt,
    this.thumbnailUrl,
    this.views,
    this.likes,
    this.comments,
    this.shares,
    this.growthRate,
    required this.viralIndex,
    required this.keywords,
    required this.hashtags,
    required this.originalUrl,
    required this.dataSourceType,
    required this.sourceLabel,
    required this.lastUpdatedAt,
  });

  factory TrendItem.fromJson(Map<String, dynamic> json) {
    return TrendItem(
      id: json['id']?.toString() ?? '',
      rank: (json['rank'] as num?)?.toInt() ?? 0,
      rankDelta: (json['rankDelta'] as num?)?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      summary: json['summary']?.toString() ?? '',
      platform: json['platform']?.toString() ?? 'youtube',
      category: json['category']?.toString() ?? '生活及娛樂',
      region: json['region']?.toString() ?? 'TW',
      timeRange: json['timeRange']?.toString() ?? '7d',
      creatorName: json['creatorName']?.toString() ?? '未知創作者',
      publishedAt: json['publishedAt']?.toString() ?? '',
      thumbnailUrl: json['thumbnailUrl']?.toString(),
      views: (json['views'] as num?)?.toInt(),
      likes: (json['likes'] as num?)?.toInt(),
      comments: (json['comments'] as num?)?.toInt(),
      shares: (json['shares'] as num?)?.toInt(),
      growthRate: (json['growthRate'] as num?)?.toDouble(),
      viralIndex: (json['viralIndex'] as num?)?.toInt() ?? 0,
      keywords: List<String>.from(json['keywords'] ?? const []),
      hashtags: List<String>.from(json['hashtags'] ?? const []),
      originalUrl: json['originalUrl']?.toString() ?? '',
      dataSourceType: json['dataSourceType']?.toString() ?? 'demo',
      sourceLabel: json['sourceLabel']?.toString() ?? '示範資料',
      lastUpdatedAt: json['lastUpdatedAt']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'rank': rank,
        'rankDelta': rankDelta,
        'title': title,
        'summary': summary,
        'platform': platform,
        'category': category,
        'region': region,
        'timeRange': timeRange,
        'creatorName': creatorName,
        'publishedAt': publishedAt,
        'thumbnailUrl': thumbnailUrl,
        'views': views,
        'likes': likes,
        'comments': comments,
        'shares': shares,
        'growthRate': growthRate,
        'viralIndex': viralIndex,
        'keywords': keywords,
        'hashtags': hashtags,
        'originalUrl': originalUrl,
        'dataSourceType': dataSourceType,
        'sourceLabel': sourceLabel,
        'lastUpdatedAt': lastUpdatedAt,
      };

  static String formatMetric(int? value) {
    if (value == null) return '暫無資料';
    if (value >= 10000) {
      return '${(value / 10000).toStringAsFixed(1)} 萬';
    }
    return value.toString();
  }
}
